use rand::Rng;
use std::cmp::Ordering;
use std::io;

fn main() {
    println!("Guess the number!");

    let secret_number = rand::thread_rng().gen_range(1..=100);
    // let secret_number = 42;

    loop {
        println!("What is your guess?");

        let mut guess = String::new();

        io::stdin()
            .read_line(&mut guess)
            .expect("Failed to read line!");

        let guess = guess.trim();
        if guess == "quit" {
            break;
        }

        let guess: u32 = match guess.parse() {
            Ok(num) => num,
            Err(_) => continue,
        };

        println!("You guessed: {guess}");

        match guess.cmp(&secret_number) {
            Ordering::Less => println!("Too small..."),
            Ordering::Greater => println!("Too big..."),
            Ordering::Equal => {
                println!("You win!");
                break;
            }
        }
    }

    println!("Thanks for playing")
}
