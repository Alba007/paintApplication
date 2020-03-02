import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {fromEvent} from 'rxjs';
import {pairwise, switchMap, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnInit {
  @ViewChild('canvas', {static: true})
  canvas: ElementRef;

  @ViewChild('downloadLink', {static: true})
  downloadLink: ElementRef;

  title = 'drawerApp';
  private ctx: CanvasRenderingContext2D;
  canvasEl: HTMLCanvasElement;
  i = 0;
  round = false;
  qendra = {
    x: 0,
    y: 0
  };
  radius = 0;
  other = false;
  rect = false;
  clear = true;
  rectinitial = {
    x: 0,
    y: 0
  };
  backgroundColor = 'white';
  delWidth = 50 ;
  drawcolor = '#e66465';
  ngAfterViewInit(): void {
    this.captureEvents(this.canvasEl);
  }

  ngOnInit() {
    this.canvasEl = this.canvas.nativeElement;
    this.canvasEl.width = 1800 ;
    this.canvasEl.height = 850;
    this.ctx = this.canvasEl.getContext('2d');
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = '#e66465';
    this.ctx.fillStyle = '#e66465';
  }

  captureEvents(canvasEl: HTMLCanvasElement) {
    // this will capture all mousedown events from the canvas element
    fromEvent(canvasEl, 'mousedown')
      .pipe(
        switchMap((e) => {
          // after a mouse down, we'll record all mouse moves
          return fromEvent(canvasEl, 'mousemove')
            .pipe(
              // we'll stop (and unsubscribe) once the user releases the mouse
              // this will trigger a 'mouseup' event
              takeUntil(fromEvent(canvasEl, 'mouseup')),
              // we'll also stop (and unsubscribe) once the mouse leaves the canvas (mouseleave event)
              takeUntil(fromEvent(canvasEl, 'mouseleave')),
              // pairwise lets us get the previous value to draw a line from
              // the previous point to the current point
              pairwise()
            );
        })
      )
      .subscribe((res: [MouseEvent, MouseEvent]) => {
        const rect = canvasEl.getBoundingClientRect();

        // previous and current position with the offset
        const prevPos = {
          x: res[0].clientX - rect.left,
          y: res[0].clientY - rect.top
        };

        const currentPos = {
          x: res[1].clientX - rect.left,
          y: res[1].clientY - rect.top
        };
        this.pickColor(this.drawcolor);
        if (this.round) {
          this.drawRound(prevPos, currentPos);
        } else {
          if (this.rect) {
            this.drawRect(prevPos, currentPos);
          } else {
            if (this.clear) {
              this.clearR(prevPos, currentPos);
            } else  {
              this.drawOnCanvas(prevPos, currentPos);
            }

          } }
        this.drawAnotherCircle(canvasEl);
      });
  }

  private drawOnCanvas(
    prevPos: { x: number, y: number },
    currentPos: { x: number, y: number }
  ) {
    // incase the context is not set
    if (!this.ctx) { return; }
    // start our drawing path
    this.ctx.beginPath();
    // we're drawing lines so we need a previous position
    if (prevPos) {
      // sets the start point
      this.ctx.moveTo(prevPos.x, prevPos.y); // from
      // draws a line from the start pos until the current position
      this.ctx.lineTo(currentPos.x, currentPos.y);
      this.ctx.closePath();
      console.log(this.ctx);
      // strokes the current path with the styles we set earlier
      this.ctx.stroke();

    }
  }
  drawAnotherCircle(canvasEl) {
    fromEvent(canvasEl, 'mouseup').subscribe(res => {
      this.i = 0;
      this.other = true ;
      this.ctx.restore();

      //  this.ctx.closePath();
    });
  }
  drawRound(prevPos: { x: number, y: number },
            currentPos: { x: number, y: number }) {
    // gjejme qendren
    if (this.i === 0) {
      this.qendra.x = prevPos.x;
      this.qendra.y = prevPos.y;
    }

    // gjejme rrezen
    const a = currentPos.x - this.qendra.x;
    const b = currentPos.y - this.qendra.y;
    const test = Math.sqrt( a * a + b * b );
    if ( test < this.radius) {
      this.ctx.scale(1,1)

    }
    this.radius = Math.sqrt( a * a + b * b );
    this.ctx.beginPath();
    this.ctx.arc(this.qendra.x, this.qendra.y, this.radius, 0, 2 * Math.PI);
    console.log(this.ctx);
    this.ctx.stroke();
    this.ctx.fill();
    this.ctx.closePath();
    this.i++;

  }

  roundF() {
    this.rect = false;
    this.round = true ;
    this.clear = false;
  }

  pickColor(color) {
    this.drawcolor = color;
    this.ctx.strokeStyle = color;
    this.ctx.fillStyle = color;
  }

  pickwidth(width) {
    this.ctx.lineCap = width;
  }
  rectF() {
    this.rect = true;
    this.round = false ;
    this.clear = false;
  }
  drawRect(prevPos: { x: number, y: number },
           currentPos: { x: number, y: number }) {
    if (this.i === 0) {
      this.rectinitial.x = prevPos.x;
      this.rectinitial.y = prevPos.y;
    }
    const pointC  = {
      x: this.rectinitial.x ,
      y: currentPos.y
    };
    let height;
    let width;
    if (currentPos.x < this.rectinitial.x && currentPos.y > this.rectinitial.y) {
      height = currentPos.y - this.rectinitial.y;
      width = this.rectinitial.x - currentPos.x;
    }
    if (currentPos.x < this.rectinitial.x && currentPos.y > this.rectinitial.y) {
      height =  this.rectinitial.y - currentPos.y ;
      width = this.rectinitial.x - currentPos.x ;
    }
    if (currentPos.x > this.rectinitial.x && currentPos.y < this.rectinitial.y) {
      height =  this.rectinitial.y - currentPos.y ;
      width =  currentPos.x -  this.rectinitial.x ;
    }
    if (currentPos.x > this.rectinitial.x && currentPos.y > this.rectinitial.y) {
      height =   currentPos.y - this.rectinitial.y  ;
      width =  currentPos.x -  this.rectinitial.x ;
    }
    this.ctx.fillRect(this.rectinitial.x , this.rectinitial.y , width, height  );
    this.i ++ ;
  }

  clearR(prevPos: { x: number, y: number },
         currentPos: { x: number, y: number }) {
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.clearRect(prevPos.x, prevPos.y, this.delWidth, this.delWidth);
    this.ctx.clearRect(currentPos.x, currentPos.y, this.delWidth, this.delWidth);
  }

  clearF() {
    this.clear = true;
    this.rect = false;
    this.round = false;
  }

  pickDelWidth(value) {
    this.delWidth = value ;
  }

  downloadAsPng(canvas) {
    this.downloadLink.nativeElement.href = canvas.toDataURL('image/png');
    this.downloadLink.nativeElement.download = 'drawer-image.png';
  }
  drawWithPencil() {
    this.clear = false;
    this.rect = false;
    this.round = false;
  }
  chooseBackgroundColor(valueColor) {
    this.backgroundColor = valueColor;
  }
}
