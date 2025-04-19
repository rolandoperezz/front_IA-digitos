import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ConsultasService {
  //urlback='http://127.0.0.1:8000/'
  urlback='https://fastapi-digitos.onrender.com/'
  constructor(private http: HttpClient) { }


  consNumero(formData: FormData): Observable<any> {
    return this.http.post(`${this.urlback}predecir`, formData);
  }


}
