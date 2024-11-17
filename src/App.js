import './App.css';
import { useState, useEffect } from 'react';

function App() {
  const CLIENT_ID = "7c3638305b0b49b3b50e4ab41309c7f7";
  const REDIRECT_URI = "http://localhost:3000/";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";
  const SCOPE = "user-read-private user-read-email"; // Define the scope based on your needs

  const [token, setToken] = useState("");
  //for the several artists
  const [artist, setArtist] = useState(null); //first artist displayed
  const [deuxArtist,setDeuxArtist] = useState(null); // second artist displayed
  const [troisArtist,setTroisArtist] = useState(null); //third artist displayed
  const [album,setAlbum]= useState(null); //to display the album info 

  const [songsearched,setSongSearched] = useState(null);
  const [song,setResultSong] = useState(null); //variable containing the result of the song searched on the form
  const [playlist, setPlaylist] = useState([{}]); //to create a playlist after the search 
  
  useEffect(() => {
    // Check if there's a token in the URL hash and set it    
    let token = window.localStorage.getItem("token");

    if (!token) {
      token = new URLSearchParams(window.location.hash.replace("#", "")).get("access_token");
      window.localStorage.setItem("token", token);
      setToken(token);
      window.location.hash = ""; 
    } else {
      setToken(token);
    }
  }, []);

  const logout = () => {
    setToken("");
    //clean the artist value
    setArtist(null);
    setDeuxArtist(null);
    setTroisArtist(null);
    setAlbum(null);
    
    setSongSearched(null);
    setResultSong(null);
    window.localStorage.removeItem("token");
  };

  //fetch one artist
  useEffect(() => {
    // Fetch artist data only if token is available
    const fetchArtist = async () => {
      if (!token) return;

      try {
        const response = await fetch("https://api.spotify.com/v1/artists/3fMbdgg4jU18AjLCKBhRSm", {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch artist data");
        }
        const data = await response.json();

        setArtist(data);
      } catch (error) {
        console.error("Error fetching the artist data:", error);
      }
    };
    fetchArtist();
    
  }, [token]);

  
//fetch several artist
  useEffect(()=>{
  const fetchSeveralArtists = async () => {
    if(!token) return;
    try{
    //requesting the API
      const [repPremierArtist,repDeuxArtist] = await Promise.all([
        fetch("https://api.spotify.com/v1/artists/3DiDSECUqqY1AuBP8qtaIa",{
          headers:{
            Authorization: `Bearer ${token}`
          }
        }),fetch("https://api.spotify.com/v1/artists/6XpaIBNiVzIetEPCWDvAFP",{
          headers:{
            Authorization: `Bearer ${token}`
          }
        })
      ])
    
    if(!repPremierArtist.ok || !repDeuxArtist.ok){
      throw new Error("not catched");
    }
    
    //Parse
    const premierArtist = await repPremierArtist.json();
    const deuxArtist = await repDeuxArtist.json();

    //processing
    setDeuxArtist(premierArtist);
    setTroisArtist(deuxArtist);

    } catch(e){
      console.error("error "+e);
    }

  }
  fetchSeveralArtists();
  },[token]);

//fetch an album
  useEffect(()=>{
    //function
    const searchAlbum = async () => {
      if(!token) return;
      try{
        const response = await fetch("https://api.spotify.com/v1/albums/14p5CVdJCMRcgvICDAGS7k",{headers:{Authorization: `Bearer ${token}` }})

        if(!response.ok){
          throw new Error("no response");
        }
        //const repSeachArtist = await response.json();
        setAlbum(await response.json());

      }catch(e){
        console.error(e);
      }
    }
    searchAlbum();

  },[token]);


//use effect fetch search 
const searchSong = async (e) =>{
  e.preventDefault(); // to avoid reloading the whole page
  //e.target.style.display = "none"; //to make the form disappear
  try{
    
    const response = await fetch(`https://api.spotify.com/v1/search?q=${songsearched}&type=track&limit=2&offset=5`,{headers:{Authorization:`Bearer ${token}`}})
    if(!response.ok){
      console.log("error loading data");
    }
    const resultSong = await response.json();
    setResultSong(resultSong);
    console.log(song);

  }catch(e){
    throw Error(e);
  }

}

//fonction permettant d'ajouter une song à la playlist
const ajoutPlaylist = (item) =>{
    setPlaylist((...prev)=>[{name :  item.name, artist : item.artists[0].name},...prev]) // a ajouter img, artist ...
    console.log(playlist);
}


  return (
    <div className="App">
      <header className="App-header">
        {!token ? (
          <a
            href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}
            onMouseOver={(event)=>event.target.click()}>
            Login to Spotify
          </a>
        ) : (
          <div>
            <p> Pour se deco </p>
            <button onClick={logout}> Logout </button>
          </div>
        )}

        {(artist && deuxArtist && troisArtist) ? (
          <div>
            

            <h3>{artist.name}</h3>
            <img src={artist.images[0].url} alt={artist.name} width="300px" height="300px"/>
            <p>Genres : {artist.genres.join(", ")}</p>

            <h3> {deuxArtist.name}</h3>
            <img src={deuxArtist.images[0].url} alt={deuxArtist.name} width="300px" height="300px"/>
            <p> {deuxArtist.genres.join(", ") }</p>

            <h3> {troisArtist.name}</h3>
            <img src={troisArtist.images[0].url} alt={troisArtist.name} width="300px" height="300px"/>
            <p> {troisArtist.genres.join(", ") }</p>
          </div>
        ) : (<p> </p>)}

        {//album
          (album)? ( 
          <div>  
            <p> Album artist : {album.artists[0].name}</p>
            <img src={album.images[0].url} width="300px" height="300px"/>
            <p> Album name : {album.name}</p>
            <p> Date : {album.release_date}</p>
            <p> Number of tracks : {album.total_tracks}</p>
          
                {/*console.log(album)*/}
            <ul>
                {album.tracks.items.map(item => 
                  
                  <li key={item.name}> {item.name} </li>
                  
                )}
            </ul>

            {/* Form to search a track*/}
          <form onSubmit={searchSong}>
              Tracks to search : <input type="text" name="song" placeholder="enter a song" onChange={(e)=>setSongSearched(e.target.value)}/>     
              <button name="submit"> Go</button>
            </form>
          </div>

          ) : (<p></p>)
        }

        {
          (song)?(
          <ul>
            {song.tracks.items.map((item,index) =>
            <div>
              <li> <span color="red"> Artist : </span> {item.artists[0].name} 
               / Song : {item.name} 
              <button onClick={()=>ajoutPlaylist(item)}> + </button>
              </li>
         
            </div>
            )}
            
            </ul>):(
          <p></p>)

        }
        
{/*assupp

                

        {//search form and 
          (songsearched) ?(
          <div> 
              <form onSubmit={searchSong}>
                Tracks to search : <input type="text" name="song" placeholder="enter a song" onChange={(e)=>setSongSearched(e.target.value)}/> 
                
                <button name="submit"> Go</button>
              </form>
          </div>):(
          <div>
              {console.log(song)}
             
          </div>)
        }




        {artist ? (
          <div>
            {console.log(artist)}
            {console.log(deuxArtist)}
            {console.log(troisArtist+"premier ")}
            <h1>{artist.name}</h1>
            <img src={artist.images[0].url} alt={artist.name} max-width="40px" />
            <p>Genres : {artist.genres.join(", ")}</p>
          </div>
        ) : (<a href="http://www.google.com/" onMouseOver={(event)=>event.target.click()}>dsqcd</a>)}


                {
          deuxArtist ? (
              <div> 
              <h1> {deuxArtist.name}</h1>
              <img src={deuxArtist.images[0].url} alt={deuxArtist.name} max-width="200"/>
              <p> {deuxArtist.genres.join(", ") }</p>
              </div>
          ) : null
        }

        
      {
          troisArtist ? (
              <div> 
              <h1> {troisArtist.name}</h1>
              <img src={troisArtist.images[0].url} alt={troisArtist.name} max-width="200"/>
              <p> {troisArtist.genres.join(", ") }</p>
              </div>
          ) : (<p>  </p>)
        }

assupp*/}


      </header>
    </div>
  );
}

export default App;
