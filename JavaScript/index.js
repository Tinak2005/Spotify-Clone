console.log("This is a music app");
let currentsong = new Audio();
let songs;
let CurrFolder;


function convertSeconds(seconds) {
  // Calculate minutes and remaining seconds
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  // Add leading zeros if necessary
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsong(folder) {
  CurrFolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/${CurrFolder}/`);
  let response = await a.text();
  // console.log(response);
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  // console.log(as);
  songs = [];
  for (let i = 0; i < as.length; i++) {
    const element = as[i];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`${CurrFolder}/`)[1]);
    }
  }
  let songlist = document
    .querySelector(".scrollbox")
    .getElementsByTagName("ul")[0];
  songlist.innerHTML = "";
  for (const song of songs) {
    songlist.innerHTML =
      songlist.innerHTML +
      ` <li>
                      <div class="musicsvg svg"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="25" height="25" color="#000000" fill="none">
                          <path d="M7 9.5C7 10.8807 5.88071 12 4.5 12C3.11929 12 2 10.8807 2 9.5C2 8.11929 3.11929 7 4.5 7C5.88071 7 7 8.11929 7 9.5ZM7 9.5V2C7.33333 2.5 7.6 4.6 10 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                          <circle cx="10.5" cy="19.5" r="2.5" stroke="currentColor" stroke-width="1.5" />
                          <circle cx="20" cy="18" r="2" stroke="currentColor" stroke-width="1.5" />
                          <path d="M13 19.5L13 11C13 10.09 13 9.63502 13.2466 9.35248C13.4932 9.06993 13.9938 9.00163 14.9949 8.86504C18.0085 8.45385 20.2013 7.19797 21.3696 6.42937C21.6498 6.24509 21.7898 6.15295 21.8949 6.20961C22 6.26627 22 6.43179 22 6.76283V17.9259" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                          <path d="M13 13C17.8 13 21 10.6667 22 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      </svg></div>
                      <div class="songinfo">${song
                        .replaceAll("%20", " ")
                        .replace(".mp3", "")}</div>
                      <div class="play">Play Now</div>
                      <div class="playsvg svg"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="25" height="25" color="#000000" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
                          <path d="M15.4531 12.3948C15.3016 13.0215 14.5857 13.4644 13.1539 14.3502C11.7697 15.2064 11.0777 15.6346 10.5199 15.4625C10.2893 15.3913 10.0793 15.2562 9.90982 15.07C9.5 14.6198 9.5 13.7465 9.5 12C9.5 10.2535 9.5 9.38018 9.90982 8.92995C10.0793 8.74381 10.2893 8.60868 10.5199 8.53753C11.0777 8.36544 11.7697 8.79357 13.1539 9.64983C14.5857 10.5356 15.3016 10.9785 15.4531 11.6052C15.5156 11.8639 15.5156 12.1361 15.4531 12.3948Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                      </svg></div>
                    </li>`;
  }

  Array.from(
    document.querySelector(".scrollbox").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      // console.log(e.querySelector(".songinfo").innerHTML);
      playaudio(e.querySelector(".songinfo").innerHTML.trim());
    });
  });
  // Set the play icon after loading the folder (before playing any song)
  document.querySelector(".controls").src = "assets/play.svg";
  return songs;
}

const playaudio = (track, pause = false) => {
  currentsong.src = `${CurrFolder}/` + track + ".mp3";
  if (!pause) {
    currentsong.play();
    document.querySelector(".controls").src = "assets/pause.svg";
  }
  document.querySelector(".song-info").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

  // Wait for the metadata to load before setting the duration
  currentsong.addEventListener("loadedmetadata", () => {
    let totalDuration = convertSeconds(currentsong.duration.toFixed(0)); // Get the total duration
    document.querySelector(".songtime").innerHTML = `00:00 / ${totalDuration}`;
  });

  // Add an event listener to autoplay the next song when the current song ends
  currentsong.addEventListener("ended", () => {
    let index = songs.indexOf(track + ".mp3"); // Get the current song index
    if (index + 1 < songs.length) {
      playaudio(songs[index + 1].replace(".mp3", "")); // Play the next song
    } else {
      // If it's the last song, stop or loop back to the first song
      playaudio(songs[0].replace(".mp3", "")); // You can change this to stop if no looping is needed
    }
  });
};
async function displayalbums() {
  let a = await fetch("http://127.0.0.1:3000/songs/");
  let response = await a.text();
  // console.log(response);
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-2)[0];
      //Get metadata of the folder
      let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
      let response = await a.json();
      console.log(response);
      let cardContainer = document.querySelector(".card-container");
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="card">
                        <div class="card-content">
                            <div class="play-button">
                                <button
                                    style="background-color:  rgb(14, 193, 14); border: none; border-radius: 50%; padding: 12px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer;">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"
                                        fill="none">
                                        <!-- Circular green background -->
                                        <circle cx="12" cy="12" r="12" fill=" rgb(14, 193, 14)" />
                                        <!-- Play icon with black fill -->
                                        <path
                                            d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                                            fill="black" stroke="black" stroke-width="1.5" stroke-linejoin="round" />
                                    </svg>
                                </button>


                            </div>
                            <img src="/songs/${folder}/cover.jpeg"
                                alt="Happy Favorites">
                            <div class="title">${response.title}</div>
                            <div class="about dullcolor">
                                ${response.description}</div>
                        </div>

                    </div>`;
    }
  }
  //Add event listener on card
Array.from(document.getElementsByClassName("card")).forEach((e) => {
  e.addEventListener("click", async (item) => {
    console.log(item, item.currentTarget.dataset);
    songs = await getsong(`songs/${item.currentTarget.dataset.folder}`);
    playaudio(songs[0].replace(".mp3", ""), true);
  });
});
}
async function main() {
  await getsong("songs/bgtracks");
  playaudio(songs[0].replace(".mp3", ""), true);
  // console.log(songs);
  //Display all the albums on the page
  displayalbums();
  let control = document.querySelector(".pause");
  control.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      document.querySelector(".controls").src = "assets/pause.svg";
    } else {
      currentsong.pause();
      document.querySelector(".controls").src = "assets/play.svg";
    }
  });
}

//timeupdate
currentsong.addEventListener("timeupdate", () => {
  // console.log(currentsong.currentTime, currentsong.duration);
  document.querySelector(".songtime").innerHTML = `${convertSeconds(
    currentsong.currentTime.toFixed(0)
  )} / ${convertSeconds(currentsong.duration.toFixed(0))}`;
  document.querySelector(".circle").style.left =
    (currentsong.currentTime / currentsong.duration) * 100 + "%";
});

//add event listener for previous button
document.querySelector(".previous-btn").addEventListener("click", () => {
  document.querySelector(".controls").src = "assets/play.svg";
  console.log(songs);
  currentsong.pause();
  console.log("clicked previous");
  console.log(currentsong.src.split("/").slice(-1)[0]);
  let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
  console.log(index);
  if (index - 1 >= 0) {
    playaudio(songs[index - 1].replace(".mp3", ""));
  }
});

//add event listener next-btn
document.querySelector(".next-btn").addEventListener("click", () => {
  currentsong.pause();
  document.querySelector(".controls").src = "assets/play.svg";
  console.log(songs);
  console.log("clicked next");
  console.log(currentsong.src.split("/").slice(-1)[0]);
  let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
  console.log(index);
  if (index + 1 < songs.length) {
    playaudio(songs[index + 1].replace(".mp3", ""));
  }
});

//Eventlistener to seekbar
document.querySelector(".seekbar").addEventListener("click", (e) => {
  let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
  document.querySelector(".circle").style.left = percent + "%";
  currentsong.currentTime = (currentsong.duration * percent) / 100;
});

// Add event listener for volume
document.querySelector("#vol-set").addEventListener("change", (e) => {
  console.log("volume set to:", e.target.value);
  currentsong.volume = parseInt(e.target.value) / 100;
  console.log(currentsong.volume);
  if (currentsong.volume == 0) {
    document.querySelector(".volume-change").src = "assets/volume-off.svg";
  } else {
    document.querySelector(".volume-change").src = "assets/volume-on.svg";
  }
});


main();

//for left side adjustments
document.querySelector(".hamburger").addEventListener("click", () => {
  document.querySelector(".left").style.left ="0";
  document.querySelector(".left").style.transition =
    "all 0.5s cubic-bezier(0.42, 0, 1, 0.51)";
});
document.querySelector(".closeleft").addEventListener("click", () => {
  document.querySelector(".left").style.left = "-100%";
});

