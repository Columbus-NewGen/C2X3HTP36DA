import React, { memo } from "react";

export interface SectionTitleProps {
  icon: any;
  title: string;
  desc?: string;
  count?: number;
}

export const SectionTitle = memo(function SectionTitle({
  icon: Icon,
  title,
  desc,
  count,
}: SectionTitleProps) {
  return (
    <div className="flex items-center justify-between mb-4 px-1 group">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm transition-transform group-hover:scale-110 text-gray-400">
          {React.isValidElement(Icon) ? Icon : <Icon size={18} />}
        </div>
        <div>
          <h3 className="text-md font-bold text-gray-900 flex items-center gap-2">
            {title}
            {count !== undefined && count > 0 && (
              <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-lime-50 text-xs font-bold text-lime-600 border border-lime-100">
                {count}
              </span>
            )}
          </h3>
          {desc && (
            <p className="text-xs font-medium text-gray-400 uppercase  leading-none mt-1">
              {desc}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});
