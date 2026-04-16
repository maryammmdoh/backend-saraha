import { RoleEnum } from "../../Common/Enums/user.enums.js";
import { forbiddenException } from "../../Common/Response/response.js";


export function authorization(roles = [RoleEnum.User]) { 
    return (req, res, next) => {
        if (!roles.includes(req.user.role))  // include method to check if the user's role is in the allowed roles , this is because we have multiple roles and we want to check if the user's role is in the allowed roles
        {
            return forbiddenException("You do not have permission to access this resource");
        }
        next();
    }
}