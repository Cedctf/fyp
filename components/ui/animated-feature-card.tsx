import { motion } from "framer-motion";

type AnimatedFeatureCardProps = {
  title: string;
  description: string;
  imageSrc: string;
  featureNumber: string;
  handle: string;
  onClick?: () => void;
};

export function AnimatedFeatureCard({
  title,
  description,
  imageSrc,
  featureNumber,
  handle,
  onClick,
}: AnimatedFeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      role="button"
      tabIndex={0}
      onClick={onClick}
      className="w-full max-w-md h-[600px] space-y-6 cursor-pointer rounded-3xl bg-gradient-to-b from-green-50/50 to-emerald-50/30 backdrop-blur-sm border border-[rgb(27,55,121)] p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 flex flex-col items-center justify-center"
    >
      <div className="mx-auto mb-6 flex h-40 w-40 items-center justify-center overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-100">
        <img
          src={imageSrc}
          alt={title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      <h3 className="text-2xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 text-sm text-slate-600">{description}</p>
      <p className="mt-4 text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
        {handle}
      </p>
    </motion.div>
  );
}

