import Image from "next/image";

export function ServlogBrand() {
  return (
    <span
      className="inline-flex rounded-xl bg-white p-3 ring-1 ring-white/10"
    >
      <Image
        src="/brand/Logo facilities.png"
        alt="Servlog"
        width={1815}
        height={871}
        sizes="(min-width: 640px) 192px, 160px"
        preload
        className="h-auto w-40 sm:w-48"
      />
    </span>
  );
}
