let rec factorial n =
  if n < 2 then
    1
  else
    n * factorial (n - 1)

let helloWorld x = 
  printfn "Hello World from F#! Factorial: %d" (factorial x)

[<EntryPoint>]
let main argv =
  let number = argv.[0] |> int
  helloWorld number
  0 // return an integer exit code
