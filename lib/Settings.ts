/**
 * Created by sungwoo on 15. 9. 8.
 */

module Settings {

    export function getBaseUrl(): string {
        return localStorage.getItem('baseUrl') || 'http://www.javaforge.com';
    }

}
