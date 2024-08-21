import React, { useEffect, useRef } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import {
  ArcRotateCamera,
  Engine,
  HemisphericLight,
  Scene,
  SceneLoader,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  Color3
} from "@babylonjs/core"
import { AdvancedDynamicTexture, Control, StackPanel, TextBlock } from '@babylonjs/gui/2D';
import "@babylonjs/loaders/glTF";
import { Challenge } from '../../utils/types';

const OwareGame = ({ challengeInfo }: {challengeInfo: Challenge}) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (canvasRef.current) {
            const engine = new Engine(canvasRef.current, true);
            const scene = new Scene(engine);
            scene.collisionsEnabled = true;

            // Camera setup
            const camera = new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 3, 15, Vector3.Zero(), scene);
            camera.attachControl(canvasRef.current, true);
            camera.checkCollisions = true

            // Camera constraints
            camera.lowerBetaLimit = Math.PI/8 ;  // Limit downward rotation
            camera.upperBetaLimit = Math.PI / 2.2;  // Limit upward rotation
            camera.lowerRadiusLimit = 1;  // Limit zoom in
            camera.upperRadiusLimit = 2;  // Limit zoom out

            // Limit camera rotation around the vertical axis
            camera.lowerAlphaLimit = Math.PI / 2;
            camera.upperAlphaLimit = Math.PI / 2;

            // Disable panning
            camera.panningSensibility = 0;

            // Light
            new HemisphericLight("light", new Vector3(0, 1, 0), scene);

            // Load the GLB model (game board)
            SceneLoader.ImportMeshAsync("", "assets/", "board.glb", scene).then((result) => {
                const board = result.meshes[0];
                board.position = new Vector3(0, 0, 0);
                board.checkCollisions = true;

                // Create an invisible sphere around the board to prevent camera from going through
                const boundingSphere = MeshBuilder.CreateSphere("boundingSphere", {diameter: 30}, scene);
                const invisibleMaterial = new StandardMaterial("invisibleMaterial", scene);
                invisibleMaterial.alpha = 0;
                boundingSphere.material = invisibleMaterial;
                boundingSphere.isPickable = false;
                boundingSphere.checkCollisions = true;

                // Use the bounding sphere to limit camera movement
                camera.setTarget(boundingSphere);
            });

            // Create GUI
            const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

            // Challenge Info Panel
            const panel = new StackPanel();
            panel.width = "300px";
            panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
            advancedTexture.addControl(panel);

            const addInfoText = (text: string) => {
                const textBlock = new TextBlock();
                textBlock.text = text;
                textBlock.color = "white";
                textBlock.height = "40px";
                panel.addControl(textBlock);
            };

            // Add challenge info to the panel
            addInfoText(`Challenge ID: ${challengeInfo.challenge_id}`);
            addInfoText(`Creator: ${challengeInfo.creator[0]}`);
            addInfoText(`Rounds: ${challengeInfo.rounds}`);
            addInfoText(`Type: ${challengeInfo.challenge_type}`);
            addInfoText(`Current Round: ${challengeInfo.current_round}`);

            // Player Info
            const playerInfoPanel = new StackPanel();
            playerInfoPanel.width = "300px";
            playerInfoPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
            playerInfoPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
            advancedTexture.addControl(playerInfoPanel);

            addInfoText.call(playerInfoPanel, `Player 1: ${challengeInfo.creator[0] ? challengeInfo.creator[0] : 'Waiting...'}`);
            addInfoText.call(playerInfoPanel, `Player 2: ${challengeInfo.opponent[0] ? challengeInfo.opponent[0] : 'Waiting...'}`);
            addInfoText.call(playerInfoPanel, `Status: ${challengeInfo.in_progress ? "Game in Progress" : "Waiting for Players"}`);

            engine.runRenderLoop(() => {
                scene.render();
            });

            const handleResize = () => {
                engine.resize();
            };

            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
                engine.dispose();
            };
        }
    }, [challengeInfo]);

    return (
        <Flex direction="column" align="center" justify="center" bg="gray.900">
          <Box 
            width="80%" 
            height="600px" 
            bg="white" 
            borderRadius="lg" 
            overflow="hidden" 
            boxShadow="xl"
          >
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
          </Box>
        </Flex>
    );
};

export default OwareGame;