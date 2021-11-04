import React, { useEffect, useRef, useState } from "react";

import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

const VideoComponent = () => {
  const [activar, setActivar] = useState(false);

  const [loading, setLoading] = useState("");

  const refVideo = useRef(null);
  const refCanvas = useRef(null);
  const refStream = useRef(null);

  const refBtnDisable = useRef(null);
  const refBtnActive = useRef(null);

  const refModel = useRef(null);

  async function setUpWebcam() {
    try {
      if (navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        refStream.current = stream;
        refVideo.current.srcObject = stream;
        const model = await cocoSsd.load();

        refModel.current = model;
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function setCanvas() {
    if (activar) {
      return;
    }

    const predictions = await refModel.current.detect(refVideo.current);

    setLoading("")
    let foundPerson = false;
    for (let i = 0; i < predictions.length; i++) {
      if (predictions[i].class == "person") {
        foundPerson = true;
      }
    }

    refCanvas.current.width = refVideo.current.videoWidth;
    refCanvas.current.height = refVideo.current.videoHeight;

    const ctx = refCanvas.current.getContext("2d");

    ctx.drawImage(
      refVideo.current,
      0,
      0,
      refCanvas.current.width,
      refCanvas.current.height
    );

    if (foundPerson) {
      predictions.forEach((predict) => {
        const bbox = predict.bbox;
        ctx.beginPath();
        ctx.rect(bbox[0], bbox[1], bbox[2], bbox[3]);
        ctx.stroke();
      });
    }

    requestAnimationFrame(() => {
      setCanvas();
    });
  }

  const onClickActivate = async () => {
    setLoading("Cargando...")
    await setUpWebcam();
    refBtnDisable.current.disabled = false;
    refBtnActive.current.disabled = true;
    setActivar(true);
    await setCanvas();
  };
  const onClickDesactivate = () => {
    refVideo.current.srcObject = null;
    refStream.current.getTracks().forEach((track) => {
      track.stop();
    });
    refBtnActive.current.disabled = false;
    refBtnDisable.current.disabled = true;

    setActivar(false);
  };

  return (
    <div>
      <video
        id="video"
        ref={refVideo}
        autoPlay={true}
        style={{ display: "none" }}
      ></video>
      <h1>{loading}</h1>
      <canvas id="canvas" ref={refCanvas}></canvas>
      <input
        type="button"
        id="activar"
        value="activar"
        onClick={onClickActivate}
        ref={refBtnActive}
      />
      <input
        type="button"
        id="desactivar"
        value="desactivar"
        onClick={onClickDesactivate}
        ref={refBtnDisable}
      />
    </div>
  );
};

export default VideoComponent;
