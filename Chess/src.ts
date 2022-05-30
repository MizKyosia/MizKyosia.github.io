class POSITION{
    constructor(x:number,y:number){this.x=x;this.y=y;return this;}
    public x:number
    public y:number
    toString():string{return this.x.toString()+','+this.y.toString()}
    up(pos:POSITION,color:boolean):number|false{
        if(this.x !== pos.x) return false
        else if(color||pos.y > this.y) return Math.abs(pos.y - this.y)
    }
    down(pos:POSITION,color:boolean):number|false{
        if(this.x !== pos.x) return false
        else if(!color||pos.y > this.y) return Math.abs(pos.y - this.y)
    }
    right(pos:POSITION,color:boolean):number|false{
        if(this.y !== pos.y) return false
        else if(pos.x > this.x) return Math.abs(pos.x - this.x)
    }
    left(pos:POSITION,color:boolean):number|false{
        if(this.y !== pos.y) return false
        else if(pos.x < this.x) return Math.abs(pos.x - this.x)
    }
    left_up(pos:POSITION,color:boolean):number|false{
        if(color ? this.y-pos.y : pos.y-this.y === this.x-pos.x) return this.x-pos.x
        return false
    }
    right_up(pos:POSITION,color:boolean):number|false{
        if(color ? this.y-pos.y : pos.y-this.y === pos.x-this.x) return pos.x-this.x
        return false
    }
    left_down(pos:POSITION,color:boolean):number|false{
        if(!color ? this.y-pos.y : pos.y-this.y === this.x-pos.x) return this.x-pos.x
        return false
    }
    right_down(pos:POSITION,color:boolean):number|false{
        if(!color ? this.y-pos.y : pos.y-this.y === pos.x-this.x) return pos.x-this.x
        return false
    }
}
type AllPieces = Pawn

class GridCell{

    constructor(color:boolean, position:POSITION, element:HTMLElement){
        this.position = position
        this.color = color
        this.element = element
        return this
    }

    private readonly position:POSITION

    private readonly color:boolean

    private readonly element:HTMLElement

    private piece:AllPieces = null

    public highlighted:boolean = false

    set_piece(piece:AllPieces|null):this{
        this.piece = piece
        return this
    }

    get_piece():AllPieces|null{
        return this.piece
    }

    get_position():POSITION{
        return this.position
    }

    get_color():boolean{
        return this.color
    }

    get_element():HTMLElement{
        return this.element
    }

    highlight():this{
        this.element.classList.add('highlight')
        this.highlighted = true
        return this
    }

    unlight():this{
        this.element.classList.remove('highlight')
        this.highlighted = false
        return this
    }

}

class BasePiece {

    constructor(color:boolean,name:string, position:POSITION){
        this.color = color
        this.name = name
        this.position = position
        return this;
    }

    protected position:POSITION = null

    protected name:string = ""

    protected color:boolean = null

    public get_position():POSITION{
        return this.position
    }

    public reposition(cell:GridCell):this{
        this.position = cell.get_position()

        return this
    }

    public get_name():string{
        return this.name
    }

    public get_color():boolean{
        return this.color
    }

}

class Pawn extends BasePiece{

    valid_cells(cells:GridCell[]):GridCell[]{
        const valid_cells:GridCell[] = []
        for(const cell of cells){
            if(cell.get_position().up(this.position,this.color) === 1 || ((cell.get_position().left_up(this.position,this.color)===1||cell.get_position().right_up(this.position,this.color)===1)&&cell.get_piece())) valid_cells.push(cell)
        }
        return valid_cells
    }
    
    public move(position:POSITION,cells:GridCell[]):this{
        if(0 < position.x && position.x < 9 && 0 < position.y && position.y < 9) this.position = position
        return this
    }

}

export {POSITION,GridCell,Pawn}