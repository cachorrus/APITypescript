import { Router, Request, Response, NextFunction } from "express";
import { PaginateOptions, PaginateResult } from "mongoose";
import * as multipart from "connect-multiparty";
import * as fs from "fs";
import * as path from "path";

// Modelos
import Artist from "../models/artist.model";
import Album from "../models/album.model";
import Song from "../models/song.model";

// Servicios
import Auth from "../services/auth.service";

class ArtistController {
    router: Router;
    upload: multipart;

    constructor() {
        this.router = Router();
        this.upload = multipart({ uploadDir: "./uploads/artists" });
        this.routes();
    }

    saveArtist(req: Request, res: Response) {
        let params = req.body;

        const name: string = params.name;
        const description: string = params.description;
        const image: string = null;

        const artist = new Artist({
            name,
            description,
            image
        });

        const status = res.statusCode;
        const msg = res.statusMessage;
        artist.save()
            .then(artist => res.json({ status, msg, ok: true, artist }))
            .catch(err => res.json({ status, msg, ok: false, err }))
    }

    updateArtist(req: Request, res: Response) {
        const Id: string = req.params.Id;

        const status = res.statusCode;
        const msg = res.statusMessage;
        Artist.findByIdAndUpdate(Id, req.body)
            .then(artist => res.json({ status, msg, ok: true, artist }))
            .catch(err => res.json({ status, msg, ok: false, err }))
    }

    getArtistsPag(req: Request, res: Response) {
        let options: PaginateOptions = {
            sort: { 'name': 1 },
            page: parseInt(req.params.page),
            limit: parseInt(req.params.itemPage)
        }

        const status = res.statusCode;
        const msg = res.statusMessage;
        Artist.paginate({}, options, (err, artists: PaginateResult<any>) => {
            if (err) {
                res.json({ status, msg, ok: false, err })
            } else {
                res.json({ status, msg, ok: true, artists })
            }
        })
    }

    getArtists(req: Request, res: Response) {
        const status = res.statusCode;
        const msg = res.statusMessage;
        Artist.find()
            .then(artists => res.json({ status, msg, ok: true, total: artists.length, artists }))
            .catch(err => res.json({ status, msg, ok: false, err }))
    }

    getArtist(req: Request, res: Response) {
        const Id: string = req.params.Id;

        const status = res.statusCode;
        const msg = res.statusMessage;
        Artist.findById(Id)
            .then(artist => res.json({ status, msg, ok: true, artist }))
            .catch(err => res.json({ status, msg, ok: false, err }))
    }

    deleteArtist(req: Request, res: Response) {
        const Id: string = req.params.Id;

        const status = res.statusCode;
        const msg = res.statusMessage;
        Artist.findByIdAndRemove(Id)
            .then(ArtistDeleted => {
                res.json({ status, msg, ok: true, ArtistDeleted });

                // Eliminar albunes del artista
                Album.find({ artist: ArtistDeleted['_id'] }).remove()
                    .then(AlbumDeleted => {
                        res.json({ status, msg, ok: true, AlbumDeleted });

                        // Eliminar canciones del album eliminado
                        Song.find({ album: AlbumDeleted['_id'] }).remove()
                            .then(SongDeleted => res.json({ status, msg, ok: true, SongDeleted }))
                            .catch(err => res.json({ status, msg, ok: false, err }))
                    })
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
            Artist.findByIdAndUpdate(Id, { image: name })
                .then(artist => res.json({ status, msg, ok: true, artist }))
                .catch(err => res.json({ status, msg, ok: false, err }))
        } else {
            res.json({ status, msg, ok: false, err: "La extención del archivo debe ser 'jpg', 'png' o 'gif'." });
        }
    }

    getImage(req: Request, res: Response) {
        const img = `./uploads/artists/${req.params.imgFile}`;

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
        this.router.post("/new", Auth.ensureAuth, this.saveArtist);

        this.router.put("/upload/:Id", [Auth.ensureAuth, this.upload], this.uploadImage);
        this.router.put("/update/:Id", Auth.ensureAuth, this.updateArtist);

        this.router.get("/all", Auth.ensureAuth, this.getArtists);
        this.router.get("/pag/:itemPage/:page", Auth.ensureAuth, this.getArtistsPag);
        this.router.get("/:Id", Auth.ensureAuth, this.getArtist);
        this.router.get("/image/:imgFile", this.getImage);

        this.router.delete("/delete/:Id", Auth.ensureAuth, this.deleteArtist);
    }
} 

// Export
const ArtistRoutes = new ArtistController();
ArtistRoutes.routes();

export default ArtistRoutes.router;