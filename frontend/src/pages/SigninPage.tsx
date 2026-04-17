import { SigninForm } from "../components/auth/signin-form";

const SignIn = () => {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10 bg-gradient-primary overflow-hidden">
      <div className="absolute inset-0 bg-white/40 backdrop-blur-2xl"></div>

      <div className="relative z-10 w-full max-w-sm md:max-w-4xl">
        <SigninForm />
      </div>
    </div>
  );
};

export default SignIn;
