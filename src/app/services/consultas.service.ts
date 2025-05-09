import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ConsultasService {
  //rlback='http://127.0.0.1:8000/'
  urlback='https://fastapi-digitos.onrender.com/'
  constructor(private http: HttpClient) { }


  consNumero(formData: FormData): Observable<any> {
    return this.http.post(`${this.urlback}predecir`, formData);
  }

  Insert(numero:any): Observable<any> {
    return this.http.post(`${this.urlback}datos`, numero);
  }



//   HOST: www.server.daossystem.pro
// PUERTO: 3301
// BD: bd_ia_lf_2025
// USER: usr_ia_lf_2025
// PASSWORD: 5sr_31_lf_2025
// TABLA: segundo_parcial



}
