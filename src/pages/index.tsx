import { useEffect } from 'react';
import { useRouter } from 'next/router';

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    if (router.pathname === "/") {
      router.push("/login");
    }
  }, [router]);

  return (
    <div>
    </div>
  );
};
export default Home;