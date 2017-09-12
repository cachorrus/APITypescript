import { Router, Request, Response, NextFunction } from "express";
import * as multipart from "connect-multiparty";
import * as fs from "fs";
import * as path from "path";

// Modelos
import Song from "../models/song.model";

// Servicios
import Auth from "../services/auth.service";

class SongController {
    router: Router;
    upload: multipart;

    constructor() {
        this.router = Router();
        this.upload = multipart({ uploadDir: "./uploads/songs" });
        this.routes();
    }

    saveSong(req: Request, res: Response) {
        let params = req.body;

        const number: string = params.number;
        const name: string = params.name;
        const duration: string = params.duration;
        const album: string = params.album;
        const file: string = null;

        const song = new Song({
            number,
            name,
            duration,
            album,
            file
        });

        const status = res.statusCode;
        const msg = res.statusMessage;
        song.save()
            .then(song => res.json({ status, msg, ok: true, song }))
            .catch(err => res.json({ status, msg, ok: false, err }))
    }

    updateSong(req: Request, res: Response) {
        const Id: string = req.params.Id;

        const status = res.statusCode;
        const msg = res.statusMessage;
        Song.findByIdAndUpdate(Id, req.body)
            .then(song => res.json({ status, msg, ok: true, song }))
            .catch(err => res.json({ status, msg, ok: false, err }))
    }

    getSongs(req: Request, res: Response) {
         let params = (req.params.IdAlbum ? { album: req.params.IdAlbum } : null);
        let order = (req.params.IdArtist ? "number" : "name");

        const status = res.statusCode;
        const msg = res.statusMessage;
        Song.find(params).sort(order).populate("album", "title description year image")
            .then(songs => res.json({ status, msg, ok: true, total: songs.length, songs }))
            .catch(err => res.json({ status, msg, ok: false, err }))
    }

    getSong(req: Request, res: Response) {
        const Id: string = req.params.Id;

        const status = res.statusCode;
        const msg = res.statusMessage;
        Song.findById(Id).populate("album", "title description year image")
            .then(song => res.json({ status, msg, ok: true, song }))
            .catch(err => res.json({ status, msg, ok: false, err }))
    }

    deleteSong(req: Request, res: Response) {
        const Id: string = req.params.Id;

        const status = res.statusCode;
        const msg = res.statusMessage;
        Song.findByIdAndRemove(Id)
            .then(SongDeleted => res.json({ status, msg, ok: true, SongDeleted }))
            .catch(err => res.json({ status, msg, ok: false, err }))
    }

    // Canciones
    uploadFile(req: Request, res: Response) {
        const Id: string = req.params.Id;

        let path: string = req['files'].file.path;
        let path_s: Array<string> = path.split("\\");
        let name: string = path_s[2];

        let name_s: Array<string> = name.split("\.");
        let ext: string = name_s[1];

        const status = res.statusCode;
        const msg = res.statusMessage;
        if (ext == "mp3" || ext == "ogg") {
            Song.findByIdAndUpdate(Id, { file: name })
                .then(user => res.json({ status, msg, ok: true, user }))
                .catch(err => res.json({ status, msg, ok: false, err }))
        } else {
            res.json({ status, msg, ok: false, err: "La extención del archivo debe ser 'mp3' o 'ogg'." });
        }
    }

    getFile(req: Request, res: Response) {
        const file = `./uploads/songs/${req.params.fileSong}`;

        const status = res.statusCode;
        const msg = res.statusMessage;
        fs.exists(file, exist => {
            if (exist) {
                res.sendfile(path.resolve(file));
            } else {
                res.json({ status, msg, ok: false, err: "No existe el fichero de audio." })
            }
        })
    }

    routes() {
        this.router.post("/new", Auth.ensureAuth, this.saveSong);

        this.router.put("/upload/:Id", [Auth.ensureAuth, this.upload], this.uploadFile);
        this.router.put("/update/:Id", Auth.ensureAuth, this.updateSong);

        this.router.get("/all/:IdAlbum?", Auth.ensureAuth, this.getSongs);
        this.router.get("/:Id", Auth.ensureAuth, this.getSong);
        this.router.get("/file/:fileSong", this.getFile);

        this.router.delete("/delete/:Id", Auth.ensureAuth, this.deleteSong);
    }
}

// Export
const SongRoutes = new SongController();
SongRoutes.routes();

export default SongRoutes.router;