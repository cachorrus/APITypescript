import * as jwt from "jwt-simple";
import * as moment from "moment";

class TokenService {

    createToken(user: any): string {
        const secret_key: string = "key_secret";
        let payload: any = {
            sub: user._id,
            name: user.name,
            surname: user.surname,
            email: user.email,
            role: user.role,
            image: user.image,
            iat: moment().unix(),
            exp: moment().add(30, 'days').unix
        };

        return jwt.encode(payload, secret_key);
    }
}

// Export
const token = new TokenService();
export default token;