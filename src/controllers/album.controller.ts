import { Router, Request, Response, NextFunction } from "express";
import * as multipart from "connect-multiparty";
import * as fs from "fs";
import * as path from "path";

// Modelos
import Album from "../models/album.model";
import Song from "../models/song.model";

// Servicios
import Auth from "../services/auth.service";

class AlbumController {
    router: Router;
    upload: multipart;

    constructor() {
        this.router = Router();
        this.upload = multipart({ uploadDir: "./uploads/albums" });
        this.routes();
    }

    saveAlbum(req: Request, res: Response) {
        let params = req.body;

        const title: string = params.title;
        const description: string = params.description;
        const year: string = params.year;
        const artist: string = params.artist;
        const image: string = null;

        const album = new Album({
            title,
            description,
            year,
            artist,
            image
        });

        const status = res.statusCode;
        const msg = res.statusMessage;
        album.save()
            .then(album => res.json({ status, msg, ok: true, album }))
            .catch(err => res.json({ status, msg, ok: false, err }))
    }

    updateAlbum(req: Request, res: Response) {
        const Id: string = req.params.Id;

        const status = res.statusCode;
        const msg = res.statusMessage;
        Album.findByIdAndUpdate(Id, req.body)
            .then(album => res.json({ status, msg, ok: true, album }))
            .catch(err => res.json({ status, msg, ok: false, err }))
    }

    getAlbums(req: Request, res: Response) {
        let params = (req.params.IdArtist ? { artist: req.params.IdArtist } : null);
        let order = (req.params.IdArtist ? "year" : "title");

        const status = res.statusCode;
        const msg = res.statusMessage;
        Album.find(params).sort(order).populate("artist", "name image")
            .then(albums => res.json({ status, msg, ok: true, total: albums.length, albums }))
            .catch(err => res.json({ status, msg, ok: false, err }))
    }

    getAlbum(req: Request, res: Response) {
        const Id: string = req.params.Id;

        const status = res.statusCode;
        const msg = res.statusMessage;
        Album.findById(Id).populate("artist", "name description image")
            .then(album => res.json({ status, msg, ok: true, album }))
            .catch(err => res.json({ status, msg, ok: false, err }))
    }

    deleteAlbum(req: Request, res: Response) {
        const Id: string = req.params.Id;

        const status = res.statusCode;
        const msg = res.statusMessage;
        Album.findByIdAndRemove(Id)
            .then(AlbumDeleted => {
                res.json({ status, msg, ok: true, AlbumDeleted });

                // Eliminar canciones del album eliminado
                Song.find({ album: AlbumDeleted['_id'] }).remove()
                    .then(SongDeleted => res.json({ status, msg, ok: true, SongDeleted }))
                    .catch(err => res.json({ status, msg, ok: false, err }))
            })
            .catch(err => res.json({ status, msg, ok: false, err }))
    }

    // Imagenes
    uploadImage(req: Request, res: Response) {
        const Id: string = req.params.Id;

        let path: string = req['files'].image.path;
        let path_s: Array<string> = path.split("\\");
        let name: string = path_s[2];

        let name_s: Array<string> = name.split("\.");
        let ext: string = name_s[1];

        const status = res.statusCode;
        const msg = res.statusMessage;
        if (ext == "png" || ext == "jpg" || ext == "gif") {
            Album.findByIdAndUpdate(Id, { image: name })
                .then(album => res.json({ status, msg, ok: true, album }))
                .catch(err => res.json({ status, msg, ok: false, err }))
        } else {
            res.json({ status, msg, ok: false, err: "La extención del archivo debe ser 'jpg', 'png' o 'gif'." });
        }
    }

    getImage(req: Request, res: Response) {
        const img = `./uploads/albums/${req.params.imgFile}`;

        const status = res.statusCode;
        const msg = res.statusMessage;
        fs.exists(img, exist => {
            if (exist) {
                res.sendfile(path.resolve(img));
            } else {
                res.json({ status, msg, ok: false, err: "No existe la imagen." })
            }
        })
    }

    routes() {
        this.router.post("/new", Auth.ensureAuth, this.saveAlbum);

        this.router.put("/upload/:Id", [Auth.ensureAuth, this.upload], this.uploadImage);
        this.router.put("/update/:Id", Auth.ensureAuth, this.updateAlbum);

        this.router.get("/all/:IdArtist?", Auth.ensureAuth, this.getAlbums);
        this.router.get("/:Id", Auth.ensureAuth, this.getAlbum);
        this.router.get("/image/:imgFile", this.getImage);

        this.router.delete("/delete/:Id", Auth.ensureAuth, this.deleteAlbum);
    }
}

// Export
const AlbumRoutes = new AlbumController();
AlbumRoutes.routes();

export default AlbumRoutes.router;