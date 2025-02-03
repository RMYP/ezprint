import Navbar from "@/components/exNavbar";

export default async function POST({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  return (
    <div>
      <Navbar props="bg-white" />
      <div className="max-w-6xl mx-auto bg-white flex flex-row-3">
        <div >
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt
            eligendi atque omnis iure fugit ipsam dolore totam! Temporibus
            ducimus ullam officia, minus quam hic autem deserunt qui accusantium
            perferendis laboriosam.
          </p>
        </div>
        <div>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit.
            Consectetur aspernatur incidunt tempore quis cupiditate mollitia
            error vitae temporibus eum a provident blanditiis rerum est
            asperiores quibusdam, cum odit beatae architecto!
          </p>
        </div>
      </div>
    </div>
  );
}
