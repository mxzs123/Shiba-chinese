"use client";

import { Globe2, ShieldCheck, PackageCheck, Stethoscope, Award, Clock, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import type { ComponentType, SVGProps } from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "lib/utils";

// 药剂师信息常量
const PHARMACIST_INFO = {
  name: "岡本 貴広",
  title: "日本注册药剂师",
  licenseNo: "第465002号",
  experience: "执业10余年",
  image: "/images/home/pharmacist-okamoto.png",
  quote: "作为日本注册药剂师，我以专业的药学知识，为您把关每一份健康托付。",
};

type AdvantageItem = {
  id: string;
  title: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  variant: "primary" | "secondary" | "tertiary"; // 用于Bento Grid的不同样式
};

const ADVANTAGE_ITEMS: AdvantageItem[] = [
  {
    id: "shipping",
    title: "全球直送",
    description: "无论身在何处，都能收到来自日本的健康产品。",
    icon: Globe2,
    variant: "secondary",
  },
  {
    id: "license",
    title: "日本正规药局",
    description: "持有官方许可，严格遵守药事法规。",
    icon: ShieldCheck,
    variant: "secondary",
  },
  {
    id: "authentic",
    title: "原装正品保障",
    description: "正规渠道采购，100%日本原装正品。",
    icon: PackageCheck,
    variant: "secondary",
  },
];

type HomeAdvantagesSectionProps = {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  className?: string;
};

export function HomeAdvantagesSection({
  eyebrow = "芝園薬局 Shiba Park Pharmacy",
  heading = "品质承诺",
  subheading = "以日本药事标准为底，结合跨境配送与专业药师服务，为全球用户打造值得信赖的购药体验。",
  className,
}: HomeAdvantagesSectionProps) {
  return (
    <section
      className={cn(
        "mx-auto w-full max-w-(--breakpoint-2xl) px-4",
        "sm:px-6 lg:px-8",
        className,
      )}
    >
      <div className="rounded-3xl bg-linear-to-b from-white/90 to-white/50 p-6 shadow-sm backdrop-blur-sm md:p-12 border border-[#049e6b]/10">
        {/* Header */}
        <header className="mb-10 flex flex-col gap-5 text-neutral-900 md:mb-14 md:max-w-3xl">
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[#049e6b]">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#049e6b]/10 px-3 py-1 tracking-[0.25em] text-xs md:text-sm">
              <span
                className="size-1.5 rounded-full bg-[#049e6b]"
                aria-hidden="true"
              />
              {eyebrow}
            </span>
          </div>
          <h2 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-5xl">
            {heading}
          </h2>
          <p className="text-base text-neutral-600 md:text-lg leading-relaxed">
            {subheading}
          </p>
        </header>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 lg:grid-rows-2 lg:h-[520px]">
          
          {/* Card 1: 药剂师 (Large Feature) - 占据左侧 1列 2行 (移动端1列) */}
          <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md md:col-span-1 md:row-span-2 flex flex-col">
            <div className="absolute inset-0 bg-linear-to-b from-[#049e6b]/5 to-transparent opacity-50" />
            
            {/* 药师照片区域 */}
            <div className="relative mb-6 aspect-square w-full max-w-[240px] self-center overflow-hidden rounded-xl bg-neutral-100 shadow-inner md:aspect-[4/5] md:max-w-none md:flex-1">
              <Image 
                src={PHARMACIST_INFO.image}
                alt={PHARMACIST_INFO.name}
                fill
                className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              {/* 经验标签 */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 rounded-lg bg-white/90 p-2 text-xs font-medium shadow-sm backdrop-blur-xs md:bottom-4 md:left-4 md:right-4">
                <div className="flex size-8 items-center justify-center rounded-full bg-[#049e6b] text-white">
                   <Award className="size-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[#049e6b] font-bold">{PHARMACIST_INFO.experience}</span>
                  <span className="text-[10px] text-neutral-500">经验保证</span>
                </div>
              </div>
            </div>

            {/* 药师信息 */}
            <div className="relative z-10 mt-auto space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">{PHARMACIST_INFO.name}</h3>
                  <p className="text-xs font-medium text-[#049e6b]">{PHARMACIST_INFO.title}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-neutral-400">药剂师注册号</p>
                  <p className="text-xs font-mono font-medium text-neutral-600">{PHARMACIST_INFO.licenseNo}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-neutral-600">
                &ldquo;{PHARMACIST_INFO.quote}&rdquo;
              </p>
              <div className="flex items-center gap-2 text-xs text-[#049e6b] font-medium">
                <Stethoscope className="size-4" />
                <span>提供专业用药指导</span>
              </div>
            </div>
          </div>

          {/* Card 2: 日本正规药局 (Medium) */}
          <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md md:col-span-1">
             <div className="absolute top-0 right-0 -mr-4 -mt-4 size-24 rounded-full bg-[#049e6b]/5 blur-2xl transition-all group-hover:bg-[#049e6b]/10" />
             <div className="mb-4 flex size-12 flex-none self-start items-center justify-center rounded-xl bg-[#049e6b]/10 text-[#049e6b]">
               <ShieldCheck className="size-6" />
             </div>
             <h3 className="mb-2 text-lg font-bold text-neutral-900">日本正规药局</h3>
            <p className="mb-4 text-sm text-neutral-600 leading-relaxed">
              持有日本厚生劳动省颁发的官方许可，严格遵守日本药事法规与管理标准。
            </p>
            <div className="mt-auto flex flex-wrap items-center gap-2 text-xs font-medium text-[#049e6b]">
              <span className="inline-flex items-center rounded-full bg-[#049e6b]/5 px-3 py-1">药事合规</span>
              <span className="inline-flex items-center rounded-full bg-[#049e6b]/5 px-3 py-1">官方许可</span>
              <span className="inline-flex items-center rounded-full bg-[#049e6b]/5 px-3 py-1">实体药师值守</span>
            </div>
          </div>

          {/* Card 3: 原装正品 (Medium) */}
          <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md md:col-span-1">
             <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-[#049e6b]/10 text-[#049e6b]">
               <PackageCheck className="size-6" />
             </div>
             <h3 className="mb-2 text-lg font-bold text-neutral-900">原装正品保障</h3>
             <p className="mb-4 text-sm text-neutral-600 leading-relaxed">
               直接对接正规医药渠道，杜绝假冒伪劣，确保每一件商品都是日本原装。
             </p>
             <div className="mt-auto flex flex-wrap gap-2">
               <span className="inline-flex items-center gap-1 rounded-md bg-[#049e6b]/5 px-2 py-1 text-xs font-medium text-[#049e6b]">
                 <CheckCircle2 className="size-3" /> 100% Authentic
               </span>
               <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600">
                 可追溯来源
               </span>
             </div>
          </div>

          {/* Card 4: 全球直送 (Wide) - 占据底部 2列 (移动端1列) */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-[#049e6b] p-6 shadow-sm text-white md:col-span-2 lg:flex-row lg:items-center lg:gap-8">
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
             <div className="absolute -right-10 -top-10 size-64 rounded-full bg-white/10 blur-3xl" />
             
             <div className="relative z-10 max-w-md space-y-2">
               <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-md">
                 <Globe2 className="size-6" />
               </div>
               <h3 className="text-xl font-bold">全球直送 Global Shipping</h3>
               <p className="text-white/90 text-sm leading-relaxed">
                 无论您身在何处，我们都致力于将日本的健康产品安全、快速地送到您手中。支持多国物流追踪。
               </p>
             </div>

             {/* 模拟物流时间轴 */}
             <div className="relative z-10 mt-6 flex items-center w-full h-12 lg:mt-0 lg:w-[320px] lg:h-auto">
               {/* 轨道线 */}
               <div className="absolute left-[6px] right-[6px] top-1/2 -translate-y-1/2 h-0.5 bg-white/30" />
               
               {/* 滑块 */}
               <div className="absolute left-[6px] right-[6px] top-1/2 -translate-y-1/2 h-0.5">
                 <motion.div 
                    initial={{ left: "0%" }}
                    animate={{ left: "100%" }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 -translate-y-1/2 h-1.5 w-8 -translate-x-1/2 rounded-full bg-white shadow-sm z-10"
                 />
               </div>

               {/* 起点：Tokyo */}
               <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
                 <div className="size-3 rounded-full bg-white shadow-sm relative z-20 ring-4 ring-[#049e6b]" />
                 <span className="absolute top-5 text-[10px] font-medium text-white/90 whitespace-nowrap">Tokyo</span>
               </div>

               {/* 终点：World */}
               <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
                 <div className="relative z-20 rounded-full bg-[#049e6b] ring-4 ring-[#049e6b]">
                   <Globe2 className="size-4 text-white" />
                 </div>
                 <span className="absolute top-6 text-[10px] font-medium text-white/90 whitespace-nowrap">World</span>
               </div>
               
               {/* 快递信息 - 调整位置到右上方或保持在右侧 */}
               <div className="hidden">
                  {/* 保持原有的EMS文本可能干扰布局，暂时隐藏或移动到卡片其他位置 */}
               </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default HomeAdvantagesSection;
