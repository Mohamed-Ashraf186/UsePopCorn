import { useEffect, useState } from "react";
import Search from "./Search";
import { NavBar } from "./NavBar";
import { NumResults } from "./NumResults";
import { Main } from "./Main";
import { Box } from "./Box";
import { MovieList } from "./MovieList";
import { WatchedSummary } from "./WatchedSummary";
import { WatchedMovieList } from "./WatchedMovieList";
import { Movie } from "./Movie";
import StarRating from "./StarRating";

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const KEY = "64e8720c";

export const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

// *****************************************************************
export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const tempQuery = "old";
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  function handleSelectMovie(id) {
    setSelectedId(selectedId === id ? null : id);
  }

  function onCloseMovie() {
    setSelectedId(null);
  }

  useEffect(
    function () {
      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`
          );

          if (!res.ok)
            throw new Error("Something went wrong with fetching movies");

          const data = await res.json();
          console.log(data);
          if (data.Response === "False" && data.Error === "Too many results.")
            return;

          if (data.Response === "False") throw new Error(data.Error);

          setMovies(data.Search);
        } catch (err) {
          console.error(err.message);

          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }

      if (!query.length) {
        setMovies([]);
        setError("");
        return;
      }

      fetchMovies();
    },
    [query]
  );

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList>
              {movies?.map((movie) => (
                <Movie
                  onSelectMovie={() => handleSelectMovie(movie.imdbID)}
                  movie={movie}
                  key={movie.imdbID}
                />
              ))}
            </MovieList>
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <SelectedMovieDetails
              setWatched={setWatched}
              selectedId={selectedId}
              onCloseMovie={onCloseMovie}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList watched={watched} />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">Loading... </p>;
}

function ErrorMessage({ message }) {
  return (
    <div className="error">
      <span> </span> {message}
    </div>
  );
}

function SelectedMovieDetails({ selectedId, onCloseMovie, setWatched }) {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);

  function handleRateMovie(rating) {
    setUserRating(rating);
    setWatched((prev) => [
      ...prev,
      {
        ...selectedMovie,
        userRating: rating,
      },
    ]);
  }

  useEffect(
    function () {
      async function fetchMovieDetails() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
          );

          if (!res.ok)
            throw new Error("Something went wrong with fetching movie details");
          const data = await res.json();
          console.log("data", data);
          setSelectedMovie(data);
          setIsLoading(false);
        } catch (err) {
          console.error(err.message);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }

      fetchMovieDetails();
    },
    [selectedId]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              ←
            </button>
            <img
              src={selectedMovie?.Poster}
              alt={`Poster of ${selectedMovie?.Title}`}
            />
            <div className="details-overview">
              <h2>{selectedMovie?.Title}</h2>
              <p>
                {selectedMovie?.Released} • {selectedMovie?.Runtime}
              </p>
              <p>{selectedMovie?.Genre}</p>
              <p>
                <span>⭐️</span>
                <span>{selectedMovie?.imdbRating} IMDB rating</span>
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              <StarRating
                size={24}
                maxRating={10}
                onSetRating={handleRateMovie}
              />
              {/* <button className="btn-add">+ Add to list</button> */}
            </div>
            <p>
              <em>{selectedMovie?.Plot}</em>
            </p>
            <p>Starring {selectedMovie?.Actors}</p>
            <p>Directed by {selectedMovie?.Director}</p>
          </section>
        </>
      )}
    </div>
  );
}

// {
//   "Title": "Breaking Bad",
//   "Year": "2008–2013",
//   "Rated": "TV-MA",
//   "Released": "20 Jan 2008",
//   "Runtime": "49 min",
//   "Genre": "Crime, Drama, Thriller",
//   "Director": "N/A",
//   "Writer": "Vince Gilligan",
//   "Actors": "Bryan Cranston, Aaron Paul, Anna Gunn",
//   "Plot": "A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student to secure his family's future.",
//   "Language": "English, Spanish",
//   "Country": "United States",
//   "Awards": "Won 16 Primetime Emmys. 169 wins & 269 nominations total",
//   "Poster": "https://m.media-amazon.com/images/M/MV5BMzU5ZGYzNmQtMTdhYy00OGRiLTg0NmQtYjVjNzliZTg1ZGE4XkEyXkFqcGc@._V1_SX300.jpg",
//   "Ratings": [
//     {
//       "Source": "Internet Movie Database",
//       "Value": "9.5/10"
//     },
//     {
//       "Source": "Rotten Tomatoes",
//       "Value": "96%"
//     }
//   ],
//   "Metascore": "N/A",
//   "imdbRating": "9.5",
//   "imdbVotes": "2,345,729",
//   "imdbID": "tt0903747",
//   "Type": "series",
//   "totalSeasons": "5",
//   "Response": "True"
// }
