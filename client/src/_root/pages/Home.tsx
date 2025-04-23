import { Link } from "react-router-dom";
import { useCategoryFilter } from "@/hooks/store";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NewArrivals, Promotion } from "@/components/root";
import SplideCarousel from "@/components/root/SplideCarousel";
import { Tag, CalendarDays, Recycle, Store } from "lucide-react";
import { useGetCategories } from "@/api/queries/category";

const Home = () => {
  return (
    <div className="flex flex-col flex-1 min-h-screen items-center bg-light-1 dark:bg-dark-2 transform transition duration-700 ease-in-out">
      <div className="w-full px-2.5 md:px-10 my-10 max-w-screen-2xl">
        <Banner />
        <div className="my-10" />
        <Hero />
        <div className="my-10" />
        <SplideCarousel />
        <div className="my-20" />
        <ShopCategories />
        <div className="my-32" />
        <NewArrivals />
        <div className="my-32" />
        <Promotion />
        <div className="my-32" />
      </div>
    </div>
  );
};

export default Home;

function Banner() {
  return (
    <div className="flex justify-between text-sm font-medium">
      <Card className="bg-accent max-w-xs h-16 pt-2">
        <CardContent className="flex flex-row w-full items-center">
          <Tag className="w-14" />
          <span>You won't get it cheaper. Full stop.</span>
        </CardContent>
      </Card>
      <Card className="bg-accent max-w-xs h-16 pt-2">
        <CardContent className="flex flex-row w-full items-center">
          <CalendarDays className="w-14 mr-2" />
          <span>Spread the cost(29.9% APR representative variable)</span>
        </CardContent>
      </Card>
      <Card className="bg-accent max-w-xs h-16 pt-2">
        <CardContent className="flex flex-row w-full items-center">
          <Recycle className="w-14 mr-2" />
          <span>
            Recycle your old tech &amp; get £5 off your next purchase.
            T&amp;Cs apply.
          </span>
        </CardContent>
      </Card>
      <Card className="bg-accent max-w-xs h-16 pt-4">
        <CardContent className="flex flex-row w-full items-center">
          <Store className="w-14" />
          <span>Free order &amp; collect in an hour</span>
        </CardContent>
      </Card>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden flex justify-center">
      <div
        className="bg-[#F3F3F3] dark:bg-dark-4 duration-700 ease-in-out w-full max-h-884 flex items-center rounded-3xl"
        style={{
          backgroundImage: `url(/images/hero-1.png)`,
          backgroundSize: "cover",
          backgroundPosition: "revert",
          backgroundRepeat: "no-repeat",
          height: "600px",
        }}
      >
        <div className="flex flex-col justify-center px-6 md:px-20 lg:px-30 xl:px-40 w-full max-w-[60%] gap-4 text-dark-4 dark:text-light-2 duration-500 ease-linear">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
            Unleash Innovation in Every Byte.
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl mt-2 font-base">
            Explore a World of Cutting-Edge Tech
          </p>
          <Link
            to="/explore"
            className={buttonVariants({
              className: "text-sm w-36 duration-700 ease-in-out",
            })}
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
}

function ShopCategories() {
  
  const { toggleCategory, removeAllCategories } = useCategoryFilter();
  const { data, isLoading, refetch } = useGetCategories();
  const categories = data?.data

  if (categories === undefined || isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="flex flex-row justify-between items-center my-10 font-jost">
        <h1 className="text-dark-4 dark:text-white/80 text-3xl">
          Shop by Categories
        </h1>
        <Link to="/explore" className="text-lg">
          Show All
        </Link>
      </div>
      <ul className="w-full grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {categories.map(({ _id, name, image, icon }) => (
          <li
            key={_id}
            className="group flex w-full flex-col self-center overflow-hidden rounded-lg bg-[#F3F3F3] dark:bg-dark-4 duration-700 ease-in-out"
          >
            <div className="relative m-6 h-40 hidden md:flex transform group-hover:animate-pulse transition-transform">
              <img
                className="max-w-xs w-full h-full object-scale-down"
                src={image}
                alt="post"
              />
            </div>

            <Link to="/explore">
              <div
                className="flex m-6 h-16 overflow-hidden items-center justify-center rounded-xl bg-background dark:bg-dark-2 transform transition duration-700 ease-in-out hover:shadow-2xl hover:-translate-y-3 hover:border-2 dark:hover:shadow-white/40"
                onClick={() => {
                  removeAllCategories();
                  toggleCategory(_id);
                }}
              >
                <span className="h-5 w-5 mr-3 text-black md:hidden">{icon}</span>
                <h5 className="text-xl font-medium capitalize text-dark-4 dark:text-white/80 font-jost">
                  {name}
                </h5>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}