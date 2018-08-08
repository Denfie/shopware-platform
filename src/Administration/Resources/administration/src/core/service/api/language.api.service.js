import ApiService from './api.service';

/**
 * Gateway for the API end point "catalog"
 * @class
 * @extends ApiService
 */
class LanguageApiService extends ApiService {
    constructor(httpClient, loginService, apiEndpoint = 'language') {
        super(httpClient, loginService, apiEndpoint);
    }
}

export default LanguageApiService;
