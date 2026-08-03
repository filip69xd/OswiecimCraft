export default function SectionHeader({
  tag,
  title,
  subtitle,
}: {
  tag: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest text-mc-green bg-mc-green2/10 border border-mc-green2/30 rounded-full mb-4">
        {tag}
      </span>
      <h2 className="font-minecraft text-2xl md:text-4xl text-mc-text mb-4 leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm md:text-base text-mc-text/70 leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}
