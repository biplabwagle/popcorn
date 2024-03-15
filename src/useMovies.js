import { useState, useEffect } from "react";
export function useMovies(searchQuery, API_KEY, API_URL, callback) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  //useEffect to fetch data and //change when data is loaded

  useEffect(() => {
    callback?.();
    const controller = new AbortController();
    async function fetchMovies() {
      try {
        setIsLoading(true);
        setError("");
        if (searchQuery.length >= 3) {
          const res = await fetch(`${API_URL}${API_KEY}&s=${searchQuery}`, {
            signal: controller.signal,
          });

          if (!res.ok)
            throw new Error("Something went wrong while fetching movies");

          const data = await res.json();

          if (data.Error && data.Response === "False") {
            throw new Error(data.Error || "Please type in a different query");
          }

          setMovies(data.Search);
          setError("");
          setIsLoading(false);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.log(error.message);
          setError(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    // handleCloseMovie();
    fetchMovies();
    // if (searchQuery.length < 3) {
    //   setMovies([]);
    //   setError("");
    //   return;
    // }
    return () => {
      controller.abort();
    };
  }, [searchQuery, API_KEY, API_URL]);

  return { movies, isLoading, error };
}
