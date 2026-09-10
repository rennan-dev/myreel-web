export function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_75%_55%_at_50%_-10%,black,transparent)]" />
      <div className="absolute -top-48 left-1/2 h-[460px] w-[720px] -translate-x-1/2 rounded-full bg-purple-700/20 blur-[150px]" />
      <div className="absolute right-[-180px] top-1/4 h-[380px] w-[380px] rounded-full bg-violet-600/10 blur-[130px]" />
      <div className="absolute bottom-[-140px] left-[-140px] h-[340px] w-[340px] rounded-full bg-indigo-800/20 blur-[120px]" />
    </div>
  );
}