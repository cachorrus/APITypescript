import * as express from "express";
import * as mongoose from "mongoose";
import * as bodyParse from "body-parser";
import * as compression from "compression";
import * as logger from "morgan";
import * as helmet from "helmet";
import * as cors from "cors";

// Importar Controllers
import UserRoutes from "./controllers/user.controller";
import ArtistRoutes from "./controllers/artist.controller";
import AlbumRoutes from "./controllers/album.controller";
import SongRoutes from "./controllers/song.controller";

// Servicio class
class Server {
    public app: express.Application;

    constructor() {
        this.app = express();
        this.config();
        this.routes();
    }

    public config(): void {
        // Conectar MongoDB
        const MONGO_URI: string = "mongodb://localhost/curso";
        mongoose.connect(process.env.MONGODB_URI || MONGO_URI)

        // Configuraciones
        this.app.use(bodyParse.urlencoded({ extended: true }));
        this.app.use(bodyParse.json());
        this.app.use(helmet());
        this.app.use(logger('dev'));
        this.app.use(compression());
        this.app.use(cors());
    }

    public routes(): void {
        let router: express.Router;
        router = express.Router();

        this.app.use("/", router);
        this.app.use("/api/v1/user", UserRoutes);
        this.app.use("/api/v1/artist", ArtistRoutes);
        this.app.use("/api/v1/album", AlbumRoutes);
        this.app.use("/api/v1/song", SongRoutes);
    }
}

export default new Server().app;