import axios from "axios";
const token = "srd1JED7b2IKW9HXyEgkpDJQutgS07n57UCLijRyXkI";
const lineNotifyUrl = "https://notify-api.line.me/api/notify";
import { FRONTEND } from './config';
// import { join } from "path";

exports.lineNotifyToDevGroup = async (msg: string, route: string, id: number, fileName: string) => {
    // let serverFile = join(
    //     __dirname, `../../dist/images/stockIt/${fileName.split('stockIt')[1]}`
    // );
    const front = "URL: " + FRONTEND + route + id
    try {
        await axios({
            method: "post",
            url: lineNotifyUrl,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Bearer ${token}`,
            },
            data: `message=${msg}${front}`
        }).then((response) => {
            console.log(response.status);

        });

        console.log("Notify Success");
        console.log(fileName);
    } catch (err) {
        console.log("Notify Error!");
        console.log(err);
    }
};
