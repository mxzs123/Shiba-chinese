import Grid from "components/grid";

export function SearchLoading() {
  return (
    <>
      <div className="mb-4 h-6" />
      <Grid className="grid-cols-2 lg:grid-cols-3">
        {Array(12)
          .fill(0)
          .map((_, index) => (
            <Grid.Item key={index} className="animate-pulse bg-neutral-100" />
          ))}
      </Grid>
    </>
  );
}

export default SearchLoading;
