// A minimal, pure-TS parser for the Java .class file format. It reads only
// the constant pool - enough to answer "which methods and fields does this
// class reference on other classes" - without needing a JVM, javap, or any
// native tooling. This is what lets the compatibility scanner run inside a
// normal Node.js serverless function (or even the browser) instead of
// requiring a Java-capable backend.
//
// Reference: JVM class file spec, section 4.4 (constant pool).

const CONSTANT_Utf8 = 1 as const;
const CONSTANT_Integer = 3 as const;
const CONSTANT_Float = 4 as const;
const CONSTANT_Long = 5 as const;
const CONSTANT_Double = 6 as const;
const CONSTANT_Class = 7 as const;
const CONSTANT_String = 8 as const;
const CONSTANT_Fieldref = 9 as const;
const CONSTANT_Methodref = 10 as const;
const CONSTANT_InterfaceMethodref = 11 as const;
const CONSTANT_NameAndType = 12 as const;
const CONSTANT_MethodHandle = 15 as const;
const CONSTANT_MethodType = 16 as const;
const CONSTANT_Dynamic = 17 as const;
const CONSTANT_InvokeDynamic = 18 as const;
const CONSTANT_Module = 19 as const;
const CONSTANT_Package = 20 as const;

type CPEntry =
  | { tag: typeof CONSTANT_Utf8; value: string }
  | { tag: typeof CONSTANT_Class; nameIndex: number }
  | { tag: typeof CONSTANT_NameAndType; nameIndex: number; descriptorIndex: number }
  | { tag: typeof CONSTANT_Fieldref | typeof CONSTANT_Methodref | typeof CONSTANT_InterfaceMethodref; classIndex: number; nameAndTypeIndex: number }
  | null; // every other tag (Integer/Float/String/MethodHandle/etc), the
          // second slot of a Long/Double, and index 0 - none of these are
          // ever looked up by this parser, so they're stored as opaque nulls
          // rather than a catch-all variant (which would otherwise break
          // TypeScript's discriminated-union narrowing below).

export type MemberRef = {
  ownerClass: string; // e.g. "net/minecraft/class_310"
  name: string; // e.g. "method_1551" or a field name
  descriptor: string; // e.g. "()Lnet/minecraft/class_310;" or a field type
  kind: "method" | "field";
};

class ByteReader {
  constructor(private buf: DataView, public pos = 0) {}
  u1(): number {
    return this.buf.getUint8(this.pos++);
  }
  u2(): number {
    const v = this.buf.getUint16(this.pos);
    this.pos += 2;
    return v;
  }
  u4(): number {
    const v = this.buf.getUint32(this.pos);
    this.pos += 4;
    return v;
  }
  skip(n: number) {
    this.pos += n;
  }
  bytes(n: number): Uint8Array {
    const out = new Uint8Array(this.buf.buffer, this.buf.byteOffset + this.pos, n);
    this.pos += n;
    return out;
  }
}

function readUtf8(reader: ByteReader, length: number): string {
  // Java's "modified UTF-8" is byte-compatible with regular UTF-8 for the
  // vast majority of real-world class file constant strings (identifiers,
  // descriptors). We decode as standard UTF-8, which is correct for
  // everything this parser actually needs (method/field/class names).
  const bytes = reader.bytes(length);
  return new TextDecoder("utf-8").decode(bytes);
}

/**
 * Parses a single .class file's constant pool and returns every
 * Methodref/Fieldref/InterfaceMethodref entry it contains, resolved to
 * (owner class, member name, descriptor). Throws if the buffer doesn't look
 * like a valid class file.
 */
export function parseClassConstantPool(data: ArrayBuffer): MemberRef[] {
  const view = new DataView(data);
  const reader = new ByteReader(view);

  const magic = reader.u4();
  if (magic !== 0xcafebabe) {
    throw new Error("Not a valid Java class file (bad magic number)");
  }
  reader.u2(); // minor version
  reader.u2(); // major version

  const cpCount = reader.u2();
  const pool: CPEntry[] = new Array(cpCount);
  pool[0] = null;

  let i = 1;
  while (i < cpCount) {
    const tag = reader.u1();
    switch (tag) {
      case CONSTANT_Utf8: {
        const len = reader.u2();
        pool[i] = { tag, value: readUtf8(reader, len) };
        i += 1;
        break;
      }
      case CONSTANT_Class: {
        pool[i] = { tag, nameIndex: reader.u2() };
        i += 1;
        break;
      }
      case CONSTANT_NameAndType: {
        pool[i] = { tag, nameIndex: reader.u2(), descriptorIndex: reader.u2() };
        i += 1;
        break;
      }
      case CONSTANT_Fieldref:
      case CONSTANT_Methodref:
      case CONSTANT_InterfaceMethodref: {
        pool[i] = { tag, classIndex: reader.u2(), nameAndTypeIndex: reader.u2() };
        i += 1;
        break;
      }
      case CONSTANT_String:
        reader.u2();
        pool[i] = null;
        i += 1;
        break;
      case CONSTANT_Integer:
      case CONSTANT_Float:
        reader.u4();
        pool[i] = null;
        i += 1;
        break;
      case CONSTANT_Long:
      case CONSTANT_Double:
        reader.u4();
        reader.u4();
        pool[i] = null;
        pool[i + 1] = null; // longs/doubles occupy two constant pool slots
        i += 2;
        break;
      case CONSTANT_MethodHandle:
        reader.u1();
        reader.u2();
        pool[i] = null;
        i += 1;
        break;
      case CONSTANT_MethodType:
        reader.u2();
        pool[i] = null;
        i += 1;
        break;
      case CONSTANT_Dynamic:
      case CONSTANT_InvokeDynamic:
        reader.u2();
        reader.u2();
        pool[i] = null;
        i += 1;
        break;
      case CONSTANT_Module:
      case CONSTANT_Package:
        reader.u2();
        pool[i] = null;
        i += 1;
        break;
      default:
        throw new Error(`Unknown constant pool tag ${tag} at index ${i} - unsupported/corrupt class file`);
    }
  }

  function utf8At(index: number): string {
    const entry = pool[index];
    if (!entry || entry.tag !== CONSTANT_Utf8) {
      throw new Error(`Expected Utf8 constant at index ${index}`);
    }
    return entry.value;
  }

  function classNameAt(index: number): string {
    const entry = pool[index];
    if (!entry || entry.tag !== CONSTANT_Class) {
      throw new Error(`Expected Class constant at index ${index}`);
    }
    return utf8At(entry.nameIndex);
  }

  const refs: MemberRef[] = [];
  for (let idx = 1; idx < cpCount; idx++) {
    const entry = pool[idx];
    if (!entry) continue;
    if (entry.tag === CONSTANT_Methodref || entry.tag === CONSTANT_InterfaceMethodref || entry.tag === CONSTANT_Fieldref) {
      const owner = classNameAt(entry.classIndex);
      const nat = pool[entry.nameAndTypeIndex];
      if (!nat || nat.tag !== CONSTANT_NameAndType) continue;
      const name = utf8At(nat.nameIndex);
      const descriptor = utf8At(nat.descriptorIndex);
      refs.push({
        ownerClass: owner,
        name,
        descriptor,
        kind: entry.tag === CONSTANT_Fieldref ? "field" : "method",
      });
    }
  }
  return refs;
}

// Only classes under net/minecraft (vanilla game code) are relevant for a
// version-compatibility scan - references to the mod's own classes, Fabric
// API, Java standard library, etc. aren't version-sensitive in the same way
// and would just add noise.
export function isVanillaMinecraftClass(ownerClass: string): boolean {
  return ownerClass.startsWith("net/minecraft/");
}
