"use client";
import { motion } from "framer-motion"; import { ReactNode } from "react";
export default function SectionReveal({children,delay=0,className}:{children:ReactNode;delay?:number;className?:string}){return <motion.div className={className} initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:"-80px"}} transition={{duration:.6,delay,ease:[.22,1,.36,1]}}>{children}</motion.div>}
