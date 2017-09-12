import { Router, Request, Response, NextFunction } from "express";
import * as bcrypt from "bcrypt-nodejs";
import * as multipart from "connect-multiparty";
import * as fs from "fs";
import * as path from "path";

// Modelos
import User from "../models/user.model";

// Servicios
import Token from "../services/jwt.service";
import Auth from "../services/auth.service";

class UserController {
    router: Router;
    upload: multipart;

    constructor() {
        this.router = Router();
        this.upload = multipart({ uploadDir: "./uploads/users" });
        this.routes();
    }

    login(req: Request, res: Response) {
        let params = req.body;

        const username: string = params.username;
        const password: string = params.password;

        console.log("Data: ", params);


        const status = res.statusCode;
        const msg = res.statusMessage;
        User.findOne({ username: username.toLowerCase() })
            .then(user => {

                // Comparar contraseñas
                bcrypt.compare(password, user['password'], (err, check) => {
                    if (check) {
                        if (params.gethash) {
                            res.json({ status, msg, ok: true, token: Token.createToken(user) });
                        } else {
                            res.json({ status, msg, ok: true, user });
                        }
                    } else {
                        res.json({ status, msg, ok: false, err: "El usuario y/o la contraseña son incorrectos." });

                    }
                })
            })
            .catch(err => res.json({ status, msg, ok: false, err }))
    }

    saveUser(req: Request, res: Response) {
        let params = req.body;

        // Encriptar contraseña
        bcrypt.hash(params.password, null, null, (err, encrypt_pass) => {

            const name: string = params.name;
            const surname: string = params.surname;
            const username: string = params.username;
            const email: string = params.email;
            const role: number = params.role;
            const image: string = null;
            const password: string = encrypt_pass;

            const user = new User({
                name,
                surname,
                username,
                email,
                role,
                image,
                password
            });

            const status = res.statusCode;
            const msg = res.statusMessage;
            user.save()
                .then(user => res.json({ status, msg, ok: true, user }))
                .catch(err => res.json({ status, msg, ok: false, err }))

            if (err) {
                res.json({ status, msg, ok: false, err: "Error al encriptar la contraseña" });
            }
        })
    }

    updateUser(req: Request, res: Response) {
        const Id: string = req.params.Id;

        const status = res.statusCode;
        const msg = res.statusMessage;
        User.findByIdAndUpdate(Id, req.body)
            .then(user => res.json({ status, msg, ok: true, user }))
            .catch(err => res.json({ status, msg, ok: false, err }))
    }

    getUsers(req: Request, res: Response) {
        const status = res.statusCode;
        const msg = res.statusMessage;
        User.find()
            .then(users => res.json({ status, msg, ok: true, cant: users.length, users }))
            .catch(err => res.json({ status, msg, ok: false, err }))
    }

    getUser(req: Request, res: Response) {
        const Id: string = req.params.Id;

        const status = res.statusCode;
        const msg = res.statusMessage;
        User.findById(Id)
            .then(user => res.json({ status, msg, ok: true, user }))
            .catch(err => res.json({ status, msg, ok: false, err }))
    }

    deleteUser(req: Request, res: Response) {
        const Id: string = req.params.Id;

        const status = res.statusCode;
        const msg = res.statusMessage;
        User.findByIdAndRemove(Id)
            .then(UserDeleted => res.json({ status, msg, ok: true, UserDeleted }))
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
            User.findByIdAndUpdate(Id, { image: name })
                .then(user => res.json({ status, msg, ok: true, user }))
                .catch(err => res.json({ status, msg, ok: false, err }))
        } else {
            res.json({ status, msg, ok: false, err: "La extención del archivo debe ser 'jpg', 'png' o 'gif'." });
        }
    }

    getImage(req: Request, res: Response) {
        const img = `./uploads/users/${req.params.imgFile}`;

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
        this.router.post("/new", this.saveUser);
        this.router.post("/login", this.login);

        this.router.put("/upload/:Id", [Auth.ensureAuth, this.upload], this.uploadImage);
        this.router.put("/update/:Id", Auth.ensureAuth, this.updateUser);

        this.router.get("/all", Auth.ensureAuth, this.getUsers);
        this.router.get("/:Id", Auth.ensureAuth, this.getUser);
        this.router.get("/image/:imgFile", this.getImage);

        this.router.delete("/delete/:Id", Auth.ensureAuth, this.deleteUser);
    }
}

// Export
const UserRoutes = new UserController();
UserRoutes.routes();

export default UserRoutes.router;