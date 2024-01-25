/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alert';

// A type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
    try{
        const url = type === 'password' 
        ? 'http://127.0.0.1:3000/api/v1/users/updateMyPaword'
        : 'http://127.0.0.1:3000/api/v1/users/updateMe';
        
        const res = await axios({
            method: 'PATCH',            // lowercase is also supported
            url: 'http://127.0.0.1:3000/api/v1/users/updateMe',
            data
        });

        if(res.data.status === 'success'){
            showAlert('success', `${type.toUpperCase()} updated successfully`);
        }

    }catch (err){
        showAlert('error', err.response.data.message);
    }

};