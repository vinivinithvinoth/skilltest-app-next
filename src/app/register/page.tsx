import RegisterForm from "./RegisterForm";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: { phone?: string };
}) {
  const { phone = "" } = searchParams ?? {};
  return <RegisterForm phone={phone} />;
}


