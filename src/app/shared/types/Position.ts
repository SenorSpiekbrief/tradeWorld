export interface Position {
    x: number;
    y:number;
    z?:number;
    parent:Position;
    child:Position;
}