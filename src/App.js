import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
const API_URL = process.env.REACT_APP_API_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}
const Logo = () => {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
};

const Search = ({ searchQuery, setSearchQuery }) => {
  const inputFocusRef = useRef(null);
  useEffect(() => {
    //if currently selected element is input then just return
    if (document.activeElement === inputFocusRef.current) return;
    //callback function to check the keystrokes
    function callback(e) {
      if (e.code === "Enter") {
        inputFocusRef.current.focus();
        setSearchQuery("");
      }
    }

    //addEventListener to trigger on enter keydown
    document.addEventListener("keydown", callback);
    //cleanup function to remove EventListener
    return () => document.removeEventListener("keydown", callback);
  }, [setSearchQuery]);

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      ref={inputFocusRef}
    />
  );
};

const NumResults = ({ movies }) => {
  return (
    <p className="num-results">
      Found <strong>{movies?.length || 0} </strong> results
    </p>
  );
};

const Box = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
};

const MovieList = ({ movies, handleSelected }) => {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          handleSelected={handleSelected}
        />
      ))}
    </ul>
  );
};

const Movie = ({ movie, handleSelected }) => {
  return (
    <li onClick={() => handleSelected(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
};

const Summary = ({ watched }) => {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));

  const avgUserRating = average(watched.map((movie) => movie.userRating));

  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  );
};

const WatchedMovieList = ({ watched, handleSelected, handleDeleteWatched }) => {
  return (
    <ul className="list list-movies">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          handleSelected={handleSelected}
          handleDeleteWatched={handleDeleteWatched}
        />
      ))}
    </ul>
  );
};

const WatchedMovie = ({ movie, handleSelected, handleDeleteWatched }) => {
  return (
    <li key={movie.imdbID} onClick={() => handleSelected(movie.imdbID)}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={(e) => handleDeleteWatched(e, movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
};

const Main = ({ children }) => {
  return <main className="main">{children}</main>;
};

const Loader = () => {
  return <p className="loading">Loading...</p>;
};

const ErrorMessage = ({ message }) => {
  return (
    <p className="error">
      <span>🙈</span>
      <span>{message}</span>
    </p>
  );
};

function SelectedMovie({
  selectedId,
  handleCloseMovie,
  handleAddWatched,
  watched,
}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");
  const countRef = useRef(0);

  useEffect(() => {
    if (userRating) countRef.current = countRef.current + 1;
  }, [userRating]);

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  //Listen to global escape keypress using useEffect
  useEffect(() => {
    const escapeListener = (e) => {
      if (e.code === "Escape") {
        handleCloseMovie();
      }
    };
    document.addEventListener("keydown", escapeListener);

    return () => {
      document.removeEventListener("keydown", escapeListener);
    };
  }, [handleCloseMovie]);

  //fetching api request based on the id of the movie selected from the
  //movie list on the left side of the User Interface
  useEffect(() => {
    const getMovieDetails = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_URL}${API_KEY}&i=${selectedId}`);
        const data = await res.json();

        setMovie(data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    getMovieDetails();
  }, [selectedId]);

  useEffect(() => {
    if (!title) return;

    document.title = `🍿 Movie | ${title}`;
    return () => {
      document.title = "🍿 Use Popcorn";
    };
  }, [title]);

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
      countRatingDecisions: countRef.current,
    };
    handleAddWatched(newWatchedMovie);
    handleCloseMovie();
  }
  const watchedUserRating = watched.find((mov) =>
    mov.imdbID === selectedId ? mov.userRating : ""
  )?.userRating;

  return (
    <div className="details">
      {isLoading && <Loader />}
      {!isLoading && (
        <>
          <header>
            <button className="btn-back" onClick={handleCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>🌟</span>
                {imdbRating}IMDB rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to List
                    </button>
                  )}
                </>
              ) : (
                <p>{`You rated ${title} with ${watchedUserRating} stars`} </p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed By {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

export default function App() {
  // const [watched, setWatched] = useState([]); //Reading the local storage instead for lazy loading
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const { movies, isLoading, error } = useMovies(
    searchQuery,
    API_KEY,
    API_URL,
    handleCloseMovie
  );
  //Read from local storage
  const [watched, setWatched] = useLocalStorageState([], "watched");

  function handleSelected(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);

    // localStorage.setItem("watched", JSON.stringify([...watched, movie]));
  }

  function handleDeleteWatched(event, id) {
    event.stopPropagation();
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }
  return (
    <>
      <NavBar movies={movies}>
        <Logo />
        <Search searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main movies={movies}>
        <Box>
          {/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} handleSelected={handleSelected} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          <>
            {selectedId ? (
              <SelectedMovie
                selectedId={selectedId}
                handleCloseMovie={handleCloseMovie}
                handleAddWatched={handleAddWatched}
                watched={watched}
              />
            ) : (
              <>
                <Summary watched={watched} />
                <WatchedMovieList
                  watched={watched}
                  handleSelected={handleSelected}
                  handleDeleteWatched={handleDeleteWatched}
                />
              </>
            )}
          </>
        </Box>
      </Main>
    </>
  );
}
