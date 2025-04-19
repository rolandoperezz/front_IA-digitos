import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ConsultasService } from './services/consultas.service';
import { Report } from 'notiflix/build/notiflix-report-aio';
import { Confirm } from 'notiflix/build/notiflix-confirm-aio';
import { Loading } from 'notiflix';

// Decorador que define el componente raíz de la aplicación
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'front_ia';

  // Inyección del servicio que hace la consulta al backend
  constructor(private ConsultaService: ConsultasService) {}

  // Número generado aleatoriamente que el usuario debe escribir
  numeroAleatorio: number = 0;

  // Resultado devuelto por el backend después de procesar el canvas
  resultadoBackend: number[] = [];

  // Variable booleana que indica si la predicción fue correcta
  esCorrecto: boolean | null = null;

  // Referencia al elemento canvas en el DOM
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  // Contexto de dibujo del canvas
  private ctx!: CanvasRenderingContext2D;

  // Indica si el usuario está actualmente dibujando
  private dibujando: boolean = false;

  // Genera un número aleatorio de 4 dígitos entre 1000 y 9999
  generarNumeroAleatorio(): number {
    return Math.floor(1000 + Math.random() * 9000);
  }

  // Asigna un nuevo número aleatorio y lo muestra en consola
  mostrarNuevoNumero(): void {
    this.numeroAleatorio = this.generarNumeroAleatorio();
    console.log('Número generado:', this.numeroAleatorio);
  }

  // Convierte un número como 1234 en un array de dígitos: [1, 2, 3, 4]
  convertirNumeroADigitos(numero: number): number[] {
    return numero.toString().split('').map(d => parseInt(d, 10));
  }

  // Lógica que se ejecuta al iniciar el componente (antes del render)
  ngOnInit(): void {
    this.mostrarNuevoNumero();
  }

  // Detecta si el dispositivo soporta entrada táctil
  esDispositivoTactil(): boolean {
    return (('ontouchstart' in window) || navigator.maxTouchPoints > 0);
  }

  // Se ejecuta una vez el componente y el DOM han sido renderizados
  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    // Ajusta el tamaño interno del canvas al tamaño visual en pantalla
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    this.ctx = ctx;
    this.pintarFondoBlanco(); // Pinta el fondo blanco para evitar fondo transparente

    const esTactil = this.esDispositivoTactil();

    if (esTactil) {
      // Eventos para dispositivos táctiles
      canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.dibujando = true;
        this.ctx.beginPath();
      });

      canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.dibujando = false;
      });

      canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (this.dibujando) {
          const rect = canvas.getBoundingClientRect();
          const x = e.touches[0].clientX - rect.left;
          const y = e.touches[0].clientY - rect.top;
          this.dibujar(x, y);
        }
      });
    } else {
      // Eventos para dispositivos con mouse
      canvas.addEventListener('mousedown', () => {
        this.dibujando = true;
        this.ctx.beginPath();
      });

      canvas.addEventListener('mouseup', () => {
        this.dibujando = false;
      });

      canvas.addEventListener('mousemove', (e: MouseEvent) => {
        if (this.dibujando) {
          const rect = canvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          this.dibujar(x, y);
        }
      });
    }
  }

  // Dibuja una línea hacia la coordenada (x, y)
  private dibujar(x: number, y: number): void {
    this.ctx.lineWidth = 10;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = 'black';
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }

  // Rellena el canvas con fondo blanco
  private pintarFondoBlanco(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Limpia el canvas, repinta el fondo blanco y genera un nuevo número
  limpiarCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.pintarFondoBlanco();
    this.mostrarNuevoNumero();
  }

  // Captura la imagen del canvas, la convierte a archivo y la envía al backend para su reconocimiento
  validarCanvas(): void {
    Loading.arrows(); // Muestra animación de carga
    const canvas = this.canvasRef.nativeElement;

    canvas.toBlob((blob) => {
      if (blob) {
        const archivo = new File([blob], 'dibujo.png', { type: 'image/png' });
        const formData = new FormData();
        formData.append('file', archivo);

        // Enviar la imagen al backend para predecir los dígitos
        this.ConsultaService.consNumero(formData).subscribe(
          (respuesta) => {
            Loading.remove(); // Quita animación de carga
            this.resultadoBackend = respuesta.digitos_detectados;

            const generado = this.convertirNumeroADigitos(this.numeroAleatorio);

            // Compara los dígitos detectados con el número generado
            this.esCorrecto = JSON.stringify(this.resultadoBackend) === JSON.stringify(generado);

            if (this.esCorrecto) {
              this.not_success('Numero Correcto');
            } else {
              this.not_warning('Numero reconocido: ' + `${JSON.stringify(this.resultadoBackend)}`);
            }
          },
          (error) => {
            Loading.remove();
            console.error('❌ Error al enviar la imagen:', error);
          }
        );
      }
    }, 'image/png');
  }

  // Muestra una notificación tipo "warning"
  not_warning(text: any) {
    Report.warning('', `${text}`, 'Listo');
  }

  // Muestra una notificación tipo "error"
  not_error(text: any) {
    Report.failure('', `${text}`, 'Listo');
  }

  // Muestra una notificación tipo "success"
  not_success(text: any) {
    Report.success('', `${text}`, 'Listo');
  }
}
