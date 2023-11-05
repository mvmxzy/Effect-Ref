import React, { useEffect, useState, useRef } from "react";
import Card from "./Card";
import axios from "axios";
import "./Deck.css";

const API_BASE_URL = "https://deckofcardsapi.com/api/deck";


function Deck() {
  const [deck, setDeck] = useState(null);
  const [drawn, setDrawn] = useState([]);

  const [isShuffling, setIsShuffling] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const timerRef = useRef(null);


  useEffect(function loadDeckFromAPI() {
    async function fetchData() {
      let d = await axios.get(`${API_BASE_URL}/new/shuffle/`);
      setDeck(d.data);
    }
    fetchData();
  }, [setDeck]);


  useEffect(function drawCardAddToDrawn() {
    async function fetchCard() {
      try {
        let drawRes = await axios.get(`${API_BASE_URL}/${deck.deck_id}/draw/`);

        if (drawRes.data.remaining === 0) throw new Error("Deck empty!");

        const card = drawRes.data.cards[0];

        setDrawn(d => [
          ...d,
          {
            id: card.code,
            name: card.suit + " " + card.value,
            image: card.image,
          },
        ]);
      } catch (err) {
        setIsDrawing(false);
        alert(err);
      }
    }

    if (isDrawing && !timerRef.current) {
      timerRef.current = setInterval(fetchCard, 1000);
    } else if (!isDrawing && timerRef.current) {
      stopDrawingCards()
    }

    function stopDrawingCards() {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return stopDrawingCards
  }, [isDrawing, deck]);


  useEffect(function shuffleDeckViaAPI() {
    async function shuffleDeck(deck) {
      try {
        await axios.get(`${API_BASE_URL}/${deck.deck_id}/shuffle/`);
        setDrawn([]);
        setIsDrawing(false);
        setIsShuffling(false);
      } catch (err) {
        alert(err);
      }
    }

    if (isShuffling && deck) shuffleDeck(deck);
  }, [isShuffling, deck]);


  function toggleDraw() {
    setIsDrawing(auto => !auto);
  }

  function startShuffling() {
    return setIsShuffling(true);
  }

  function renderDrawBtnIfOk() {
    if (!deck) return null;

    return (
        <button
            className="Deck-gimme"
            onClick={toggleDraw}
            disabled={isShuffling}>
          {isDrawing ? "STOP " : "KEEP "} DRAWING FOR ME
        </button>
    );
  }

  function renderShuffleBtnIfOk() {
    if (!deck) return null;
    return (
        <button
            className="Deck-gimme"
            onClick={startShuffling}
            disabled={isShuffling}>
          SHUFFLE DECK
        </button>
    );
  }

  return (
      <main className="Deck">

        { renderDrawBtnIfOk() }
        { renderShuffleBtnIfOk() }

        <div className="Deck-cardarea">{
          drawn.map(c => (
              <Card key={c.id} name={c.name} image={c.image} />
          ))}
        </div>

      </main>
  );
}

export default Deck;
