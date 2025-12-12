import type { MedicalInfo } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type MedicalInfoSectionProps = {
  medicalInfo?: MedicalInfo;
  className?: string;
};

const FIELD_LABELS: Array<{
  key: keyof MedicalInfo;
  label: string;
}> = [
  { key: "name", label: "药品名称" },
  { key: "genericName", label: "通用名" },
  { key: "efficacy", label: "功能主治" },
  { key: "dosage", label: "用法用量" },
  { key: "sideEffects", label: "副作用与注意事项" },
  { key: "warnings", label: "警告与禁忌" },
  { key: "description", label: "药品说明" },
  { key: "contentVolume", label: "内容量" },
  { key: "dosageForm", label: "剂型" },
  { key: "ingredients", label: "成分列表" },
];

export function MedicalInfoSection({
  medicalInfo,
  className,
}: MedicalInfoSectionProps) {
  if (!medicalInfo) {
    return null;
  }

  const sections = FIELD_LABELS.map(({ key, label }) => {
    const bilingual = medicalInfo[key];
    if (!bilingual) {
      return null;
    }

    const jp = bilingual.jp?.trim();
    const zh = bilingual.zh?.trim();
    if (!jp && !zh) {
      return null;
    }

    return (
      <div key={key} className="space-y-2">
        <h3 className="text-sm font-medium text-neutral-800">{label}</h3>
        {jp ? (
          <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-700">
            {jp}
          </p>
        ) : null}
        {jp && zh ? <div className="my-3 h-px bg-neutral-200" /> : null}
        {zh ? (
          <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-600">
            {zh}
          </p>
        ) : null}
      </div>
    );
  }).filter(Boolean);

  if (!sections.length) {
    return null;
  }

  return (
    <section className={cn("space-y-4", className)}>
      <h2 className="text-lg font-semibold text-neutral-900">
        药品信息（中日对照）
      </h2>
      <div className="space-y-5">{sections}</div>
    </section>
  );
}

