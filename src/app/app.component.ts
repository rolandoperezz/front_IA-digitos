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

  numeroLetras:any
  factorial:any

  // Referencia al elemento canvas en el DOM
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  // @ViewChild('video', { static: false }) videoRef!: ElementRef<HTMLVideoElement>;


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
    // this.startCamera()
  }

    // Accede a la cámara del dispositivo
    // Función para iniciar la cámara
    // startCamera(): void {
    //   const video = this.videoRef.nativeElement;
  
    //   // Acceder a la cámara y mostrarla en el elemento video
    //   navigator.mediaDevices.getUserMedia({ video: true })
    //     .then((stream) => {
    //       video.srcObject = stream;
    //     })
    //     .catch((err) => {
    //       console.error('❌ Error al acceder a la cámara:', err);
    //     });
    // }

    // Este método se llama cuando el usuario selecciona un archivo
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.loadImage(file);
    }
  }

  
  // Carga la imagen seleccionada en el canvas
  loadImage(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.src = e.target.result;
      
      img.onload = () => {
        const canvas = this.canvasRef.nativeElement;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        
        // Ajusta el tamaño del canvas según las dimensiones de la imagen
        canvas.width = img.width;
        canvas.height = img.height;

        // Dibuja la imagen en el canvas
        ctx.drawImage(img, 0, 0);
      };
    };
    
    reader.readAsDataURL(file); // Leer el archivo como URL
  }

  

  
    
  

  // Detecta si el dispositivo soporta entrada táctil
  esDispositivoTactil(): boolean {
    return (('ontouchstart' in window) || navigator.maxTouchPoints > 0);
  }

  // Se ejecuta una vez el componente y el DOM han sido renderizados
  ngAfterViewInit(): void {

    // if (this.videoRef) {
    //   this.startCamera();
    // } else {
    //   console.error('❌ Error: videoRef no está inicializado correctamente');
    // }

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
              this.not_success('Numero reconocido correctamente por Modelo' + `${JSON.stringify(this.resultadoBackend)}`);
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

  capturarImagen(): void {
    Loading.arrows(); // Muestra animación de carga
    const canvas = this.canvasRef.nativeElement;

    canvas.toBlob((blob) => {
      if (blob) {
        const archivo = new File([blob], 'captura.png', { type: 'image/png' });
        const formData = new FormData();
        formData.append('file', archivo);

        // Enviar la imagen al backend para predecir los dígitos
        this.ConsultaService.consNumero(formData).subscribe(
          (respuesta) => {
            Loading.remove(); // Quita animación de carga
            this.resultadoBackend = respuesta.digitos_detectados;
            console.log(this.resultadoBackend)
            // const generado = this.convertirNumeroADigitos(this.numeroAleatorio);
            // this.esCorrecto = JSON.stringify(this.resultadoBackend) === JSON.stringify(generado);
            this.esCorrecto = true;

               // Convierte el array de dígitos a un número (como una cadena de texto)
          const numero = this.convertirArrayANumero(this.resultadoBackend);
          
          // Convierte el número a texto
          this.numeroLetras = this.convertirNumeroALetras(numero);

          // Calcula el factorial de la cifra
          this.factorial = this.calcularFactorial(numero);

          // Mostrar los resultados
          // console.log('Número en letras:', numeroEnLetras);
          // console.log('Factorial:', factorial);

          // const data = {
          //   numero: (numero).toString(),
          //   factorial: (this.factorial).toString(),
          //   nombre_estudiante: "Rolando Perez",
          // };
      
          // this.ConsultaService.Insert(data).subscribe(
          //   (info) => {
          //     console.log('Respuesta del backend:', info);
          //   },
          //   (error) => {
          //     console.error('Error al insertar datos:', error);
          //   }
          // );


            if (this.esCorrecto) {
              this.not_success('Número reconocido: ' + `${JSON.stringify(this.resultadoBackend)}, ${this.numeroLetras}, ${this.factorial}`);
            } else {
              this.not_warning('Número reconocido: ' + `${JSON.stringify(this.resultadoBackend)}`);
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


  // Método para procesar la imagen y convertirla a escala de grises


// Convierte el array de dígitos a un número
convertirArrayANumero(array: number[]): number {
  return parseInt(array.join(''), 10); // Convierte el array de números en un número
}

// Convierte un número a su equivalente en palabras
convertirNumeroALetras(numero: number): string {
  const numerosEnLetras: { [key: number]: string } = {
    0: 'cero',
    1: 'uno',
    2: 'dos',
    3: 'tres',
    4: 'cuatro',
    5: 'cinco',
    6: 'seis',
    7: 'siete',
    8: 'ocho',
    9: 'nueve',
  };

  return numero
    .toString()
    .split('')
    .map(digit => numerosEnLetras[parseInt(digit, 10)])
    .join(' '); // Convierte cada dígito a su palabra correspondiente y las une con espacios
}

// Función para calcular el factorial de un número
calcularFactorial(numero: number): string {
  // Función recursiva para calcular el factorial
  if (numero <= 1) {
    return '1'; // El factorial de 0 o 1 es 1
  } else {
    const factorialRecursivo = BigInt(numero) * BigInt(this.calcularFactorial(numero - 1)); // Llamada recursiva para calcular el factorial
    const factorialStr = factorialRecursivo.toString(); // Convertir el BigInt a string

    // Mostrar solo los primeros 10 dígitos del factorial (puedes cambiar el número 10 a la cantidad de dígitos que necesites)
    return factorialStr.slice(0, 10); 
  }
}

}
