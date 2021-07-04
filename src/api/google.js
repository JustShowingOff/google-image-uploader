//code for network requests
import qs from 'qs'; //to create url
import axios from 'axios';
// import { Promise } from 'core-js';
const CLIENT_ID = '42970916152-1u1bubd8ak5r7ra7725pq1m8ev79acj8.apps.googleusercontent.com'
const ROOT_URL = 'https://accounts.google.com/o/oauth2/v2/auth?';
const PHOTOS_URL = 'https://photoslibrary.googleapis.com/v1/';
//Details: https://console.cloud.google.com/apis/api/photoslibrary.googleapis.com/credentials?authuser=0&project=vue-image-upload-1625309485170
 
 
export default {
    login() {
        const querystring = {         
            include_granted_scopes: true,
            response_type: 'token',
            scope: 'https://www.googleapis.com/auth/photoslibrary.readonly https://www.googleapis.com/auth/photoslibrary.appendonly https://www.googleapis.com/auth/photoslibrary.readonly.appcreateddata https://www.googleapis.com/auth/photoslibrary.edit.appcreateddata https://www.googleapis.com/auth/photoslibrary https://www.googleapis.com/auth/photoslibrary.sharing',
            client_id: CLIENT_ID,
            redirect_uri: 'http://localhost:8080/oauth2/callback',
        };
        window.location = `${ROOT_URL}?${qs.stringify(querystring)}`;
 
    },
 
    fetchImages(token) {
        return axios.get(`${PHOTOS_URL}mediaItems`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    },
 
    uploadImages(images, token) {
        const promises = Array.from(images).map(image => {
            const formData = new FormData();
            formData.append('image',image);
            return new Promise(r => {
                axios.post(`${PHOTOS_URL}uploads`, image, {
                    headers: {
                        'Content-Type': "application/octet-stream",
                        'X-Goog-Upload-File-Name': image.name,
                        'X-Goog-Upload-Protocol': "raw",
                        'Authorization': `Bearer ${token}`,
                    }
                }).then((response) => {
                    r({ description: "item-description", simpleMediaItem: { fileName: image.name, uploadToken: response.data } });
                });
            });
        });
        return Promise.all(promises).then(e => {
            return new Promise((resolve, reject) => {
                axios.post(`${PHOTOS_URL}mediaItems:batchCreate`,
                    JSON.stringify({ newMediaItems: e }),
                    {
                        headers: { 'Content-type': 'application/json', 'Authorization': `Bearer ${token}` },
                    })
                    .then(resolve)
                    .catch(reject);
            });
        });
    },
}