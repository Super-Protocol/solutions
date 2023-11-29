import { Agent } from 'https';
import axios, { AxiosRequestConfig } from 'axios';

import { IHttpsApiProvider } from "../common/intrefaces";
import { ApiConfig, HttpResponse } from "../common/types";

class HttpsProvider implements IHttpsApiProvider {
    private endpoint: string;
    private requestConfig: AxiosRequestConfig;

    constructor(apiConfig: ApiConfig, rootCertificates: Buffer[]) {
        this.endpoint = apiConfig.endpoint;

        const httpsAgent = new Agent({
            rejectUnauthorized: true, // base certs checking
            ca: rootCertificates
        });

        if (apiConfig.auth) {
            this.requestConfig = {
                httpsAgent: httpsAgent,
                headers: {
                    [apiConfig.auth.header]: apiConfig.auth.key,
                },
            };
        } else {
            this.requestConfig = { httpsAgent: httpsAgent }
        };
    }

    async get(): Promise<HttpResponse> {
        try {
            return await axios.get(this.endpoint, this.requestConfig);
        } catch (e) {
            throw Error('HTTPS request failed: '+ e);
        }
    }
}

export default HttpsProvider;
