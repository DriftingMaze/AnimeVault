import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
const API_URL = "https://api.jikan.moe/v4";

app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

app.get("/", async (req, res) => {
    try {
        let result = await axios.get(API_URL + `/top/anime`);
        const animes = result.data.data.map(anime => ({
            name: anime.title_english ? anime.title_english : anime.title,
            image: anime.images.jpg.image_url
        }));
        res.render("index.ejs", {animes: animes, error: null});
    } catch (error) {
        res.render("index.ejs", {animes: null, error: error.message });
    }
});

app.post("/", (req,res) => {
    const requestedAnime = req.body["requestedAnime"];
    res.redirect(`/${requestedAnime}`);
});

app.get("/:heading", async (req,res) => {
    const requestedAnime = req.params.heading;
    try {
        let result = await axios.get(API_URL + `/anime`, {
            params: {
                q: requestedAnime
            }
        });
        const anime = result.data.data[0];
        const animeDetails = {
            name: anime.title_english ? anime.title_english : anime.title,
            image: anime.images.jpg.image_url,
            trailerID: anime.trailer.youtube_id,
            synopsis: anime.synopsis.replace("[Written by MAL Rewrite]", ""),
            status: anime.status,
            episodes: anime.episodes,
            score: anime.score,
            studio: anime.studios[0].name
        }
        res.render("animeDetails.ejs", {details: animeDetails, error: null});
    } catch (error) {
        console.log(error.message);
        res.render("animeDetails.ejs", {details: null, error: error.message});
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});