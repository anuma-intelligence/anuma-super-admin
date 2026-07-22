import SignInForm from "./sign-in-form";

export default function LoginPage() {
  return (
    <div
      className="relative flex min-h-svh flex-col items-center justify-center bg-[#1b1b1b] p-6"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 900px 620px at 50% 42%, rgba(255,255,255,0.04), transparent 72%)," +
          "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
        backgroundSize: "auto, 16px 16px",
      }}
    >
      <div className="mb-7 flex items-center gap-3 text-white">
        <span className="anuma-serif text-[22px] font-normal lowercase leading-none">
          anuma
        </span>
        <span className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-white/60">
          super admin
        </span>
      </div>

      <div className="w-full max-w-[400px] rounded-[16px] bg-white p-8 shadow-[0_1px_2px_rgba(16,17,20,0.06)] ring-1 ring-white/10">
        <SignInForm />
      </div>
    </div>
  );
}
