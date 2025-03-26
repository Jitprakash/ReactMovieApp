import './App.css'
import React from 'react'
import Search from './components/Search'
import { useState, useEffect } from 'react'
import { useDebounce } from 'react-use'
import Spinner from './components/Spinner';
import MovieCrad from './components/MovieCrad';
import { getTrendingMovies, updateSearchCount } from './appwrite'

//API base url
const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDb_API_KEY;//key

//Options to be send along with api
const API_OPTION = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}


//Main Application
function App() {


  //A state for Search
  const [searchTerm, setSearchTerm] = useState('');

  //A state for error
  const [errorMsg, setErrorMsg] = useState('');

  //A state to store all the Movies
  const [movieList, setMovieList] = useState([]);

  // A state for Trending Movies
  const [trendingMovieList, setTrendingMovieList] = useState([]);

  //A state for Loading
  const [isLoading, setIsLoading] = useState(false);

  //A state for Debouncing
  const [debounceSearchTerm, setDebounceSearchTerm] = useState('');

  //Implementing Debouncing for search
  //Debouncing ensures that the fetchMovies function is called only after the user stops typing for a specified amount of time (500 milliseconds in your case).
  //This reduces the number of API calls and improves performance.
  useDebounce(() => setDebounceSearchTerm(searchTerm), 500, [searchTerm]);

  //To call the api and fetch movies
  const fetchMovies = async (query = '') => {

    //At the start set loading true
    setIsLoading(true);
    setErrorMsg('');

    try {
      //creating the endpoint or main url to fetch all the movies
      let endpoint = query ?
        `${API_BASE_URL}/search/movie?&query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc`;

      //fetching data
      let response = await fetch(endpoint, API_OPTION);

      if (!response.ok) {
        throw new Error("Failed to fetch Movies");
      }

      let data = await response.json();
      if (data.Response === 'false') {
        setErrorMsg(data.Error || "Failed to fetch movies");
        setMovieList([]);
        return;
      }

      //Add Movies to Movie List
      setMovieList(data.results || []);

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    }
    catch (error) {
      console.log(`Problem in fetching the movies-> ${error}`);
      setErrorMsg("Error Fetching Movies!, Please try again letter");
    } finally {
      setIsLoading(false);
    }
  }

  //To load trending Movies
  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovieList(movies);
    } catch (error) {
      console.error("Error!! Fetching Trending Movies ", error);
    }
  }


  useEffect(() => {
    fetchMovies(debounceSearchTerm);
  }, [debounceSearchTerm])

  useEffect(() => {
    loadTrendingMovies();
  }, [])

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without Hassel</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {
          trendingMovieList.length > 0 && (
            <section className='trending'>
              <h2>Trending Movies</h2>

              <ul>
                {
                  trendingMovieList.map((movie, index) => (
                    <li key={movie.$id}>
                      <p>{index + 1}</p>
                      <img src={movie.poster_url} alt={movie.title} />
                    </li>
                  ))
                }
              </ul>
            </section>
          )
        }

        <section className="all-movies">
          <h2>All Movies</h2>

          {/* Check If Loading and show Loading screen */}

          {isLoading ?
            (<Spinner />)
            : errorMsg ? //Check If theres any error message and show error message
              (<p className='text-red-500'>{errorMsg}</p>)
              : //Finaly If everything is right show the movies
              (
                <ul>
                  {movieList.map((movie) => (
                    <MovieCrad key={movie.id} movie={movie} />
                  ))}
                </ul>
              )
          }

        </section>
      </div>
    </main>
  )
}

export default App