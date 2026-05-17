import { useRouter } from "next/router";

export default function Note() {
  const router = useRouter();
  const { id } = router.query;
  return <h1>Note {id} </h1>;
}
