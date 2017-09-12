import { Request, Response, NextFunction } from "express";
import * as jwt from "jwt-simple";
import * as moment from "moment";

class AuthService {

    ensureAuth(req: Request, res: Response, next: NextFunction) {
        const auth: any = req.headers.authorization;
        const secret_key: string = "key_secret";

        let user: any;

        if (!auth) {
            let status = res.statusCode;
            return res.json({ status, ok: false, err: "La petición no tiene la cabecera de 'Authorization'." });
        } else {
            let token = auth.replace(/['"]+/g, '');

            try {
                user = jwt.decode(token, secret_key);

                if (user.exp <= moment().unix()) {
                    let status = res.statusCode;
                    return res.json({ status, ok: false, err: "El token ha expirado." });
                }
            } catch (err) {
                let status = res.statusCode;
                return res.json({ status, ok: false, err: "Token invalido." });
            }
        }
        
        req['user'] = user;
        next();
    }
}

// Export
const auth = new AuthService();
export default auth;