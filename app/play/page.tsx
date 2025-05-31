"use client"

import React, { useRef, useEffect, useState } from 'react';

const PLAYER_RADIUS = 20;
const FOOD_RADIUS = 8;
const PLAYER_SPEED = 0.0001;
const WORLD_W = 1000;
const WORLD_H = 1000;
const GAME_ID = 'default';

export default function Play() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const player = useRef({ x: WORLD_W / 2, y: WORLD_H / 2, r: PLAYER_RADIUS, targetX: WORLD_W / 2, targetY: WORLD_H / 2 });
    const food = useRef<any[]>([]);
    const [score, setScore] = useState(0);
    const [viewport, setViewport] = useState({ w: 0, h: 0 });
    const time = useRef(0);
    const mouse = useRef({ x: 0, y: 0 });
    const [name, setName] = useState("");
    const [showModal, setShowModal] = useState(true);
    const nameInputRef = useRef<HTMLInputElement>(null);
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [players, setPlayers] = useState<any[]>([]);
    const [myId, setMyId] = useState<string | null>(null);
    const [wasEaten, setWasEaten] = useState(false);


    useEffect(() => {
        const resize = () => {
            setViewport({ w: window.innerWidth, h: window.innerHeight });
            const canvas = canvasRef.current;
            if (canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
        };
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);

    useEffect(() => {
        if (showModal && nameInputRef.current) nameInputRef.current.focus();
    }, [showModal]);

    useEffect(() => {
        if (showModal || !name) return;
        const wsUrl = `ws://localhost:3001/ws/${GAME_ID}`;
        const socket = new window.WebSocket(wsUrl);
        setWs(socket);
        socket.onopen = () => {
            socket.send(JSON.stringify({ type: 'join', name, gameId: GAME_ID }));
        };
        socket.onmessage = e => {
            const msg = JSON.parse(e.data);
            if (msg.type === 'state') {
                setPlayers(msg.players);
                food.current = msg.food;
                if (!myId) {
                    const me = msg.players.find((p: any) => p.name === name);
                    if (me) setMyId(me.id);
                }
                const me = msg.players.find((p: any) => p.id === (myId || (msg.players.find((p: any) => p.name === name)?.id)));
                setScore(me?.score || 0);
                if (myId && !msg.players.some((p: any) => p.id === myId)) {
                    setWasEaten(true);
                }
            }
        };
        return () => { socket.close(); };
    }, [showModal, name]);

    useEffect(() => {
        if (!ws || !myId) return;
        let animation: number;
        const sendMove = () => {
            ws.readyState === 1 && ws.send(JSON.stringify({ type: 'move', x: player.current.x, y: player.current.y }));
        };
        const handleMouse = (e: MouseEvent) => {
            mouse.current = { x: e.clientX, y: e.clientY };
        };
        const canvas = canvasRef.current;
        canvas?.addEventListener('mousemove', handleMouse);
        const draw = (t: number) => {
            time.current = t / 1000;
            const { w, h } = viewport;
            const me = players.find(p => p.id === myId) || { x: WORLD_W / 2, y: WORLD_H / 2 };
            const dx = player.current.targetX - player.current.x;
            const dy = player.current.targetY - player.current.y;
            const distToTarget = Math.hypot(dx, dy);
            const maxStep = PLAYER_SPEED * Math.max(viewport.w, viewport.h);
            if (distToTarget > maxStep) {
                player.current.x += (dx / distToTarget) * maxStep;
                player.current.y += (dy / distToTarget) * maxStep;
            } else {
                player.current.x = player.current.targetX;
                player.current.y = player.current.targetY;
            }
            const camX = me.x - w / 2;
            const camY = me.y - h / 2;
            const mouseWorld = { x: camX + mouse.current.x, y: camY + mouse.current.y };
            player.current.targetX += (mouseWorld.x - player.current.targetX) * 0.2;
            player.current.targetY += (mouseWorld.y - player.current.targetY) * 0.2;
            player.current.x = Math.max(PLAYER_RADIUS, Math.min(WORLD_W - PLAYER_RADIUS, player.current.x));
            player.current.y = Math.max(PLAYER_RADIUS, Math.min(WORLD_H - PLAYER_RADIUS, player.current.y));
            sendMove();
            const camera = {
                x: Math.max(0, Math.min(WORLD_W - w, me.x - w / 2)),
                y: Math.max(0, Math.min(WORLD_H - h, me.y - h / 2)),
            };
            const ctx = canvasRef.current?.getContext('2d');
            if (!ctx) return;
            ctx.clearRect(0, 0, w, h);
            ctx.save();
            ctx.translate(-camera.x, -camera.y);
            ctx.strokeStyle = '#bae6fd';
            ctx.lineWidth = 8;
            ctx.strokeRect(0, 0, WORLD_W, WORLD_H);
            food.current.forEach(f => {
                ctx.beginPath();
                ctx.arc(f.x, f.y, FOOD_RADIUS, 0, 2 * Math.PI);
                ctx.fillStyle = '#4ade80';
                ctx.shadowColor = '#22d3ee';
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.font = 'bold 14px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#0f172a';
                ctx.fillText(f.score, f.x, f.y - FOOD_RADIUS - 8);
            });
            players.forEach(p => {
                const isMe = p.id === myId;
                const wobble = Math.sin(time.current * 2 + (isMe ? 0 : p.id.length)) * 2;
                ctx.beginPath();
                ctx.arc(p.x, p.y, PLAYER_RADIUS + wobble, 0, 2 * Math.PI);
                ctx.fillStyle = isMe ? '#60a5fa' : '#818cf8';
                ctx.shadowColor = isMe ? '#2563eb' : '#6366f1';
                ctx.shadowBlur = isMe ? 16 : 8;
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.font = `bold 20px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#fff';
                ctx.strokeStyle = '#1e293b';
                ctx.lineWidth = 4;
                ctx.strokeText(p.name, p.x, p.y);
                ctx.fillText(p.name, p.x, p.y);
            });
            ctx.restore();
            animation = requestAnimationFrame(draw);
        };
        draw(0);
        return () => {
            cancelAnimationFrame(animation);
            canvas?.removeEventListener('mousemove', handleMouse);
        };
    }, [ws, myId, players, viewport]);

    useEffect(() => {
        if (!ws || !myId) return;
        const handleClick = (e: MouseEvent) => {
            const { w, h } = viewport;
            const me = players.find(p => p.id === myId) || { x: WORLD_W / 2, y: WORLD_H / 2 };
            const camX = me.x - w / 2;
            const camY = me.y - h / 2;
            const clickWorld = { x: camX + e.clientX, y: camY + e.clientY };
            const f = food.current.find(f => Math.hypot(f.x - clickWorld.x, f.y - clickWorld.y) < FOOD_RADIUS + PLAYER_RADIUS);
            if (f) ws.send(JSON.stringify({ type: 'eat', foodId: f.id }));
        };
        const canvas = canvasRef.current;
        canvas?.addEventListener('click', handleClick);
        return () => { canvas?.removeEventListener('click', handleClick); };
    }, [ws, myId, players, viewport]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) setShowModal(false);
    };

    const handleRestart = () => {
        setWasEaten(false);
        setShowModal(true);
        setName("");
        setMyId(null);
        setScore(0);
    };

    return (
        <>
            {showModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(30,41,59,0.7)',
                    zIndex: 50,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <form onSubmit={handleSubmit} style={{
                        background: '#fff',
                        borderRadius: 24,
                        padding: '32px 40px',
                        boxShadow: '0 8px 32px 0 rgba(0,0,0,0.18)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 20,
                        minWidth: 320,
                    }}>
                        <h2 style={{ color: '#0f172a', fontWeight: 700, fontSize: 28, margin: 0 }}>Enter your name</h2>
                        <input
                            ref={nameInputRef}
                            value={name}
                            onChange={e => setName(e.target.value)}
                            style={{
                                fontSize: 20,
                                padding: '10px 18px',
                                borderRadius: 12,
                                border: '1.5px solid #94a3b8',
                                outline: 'none',
                                width: 200,
                                textAlign: 'center',
                            }}
                            maxLength={16}
                            placeholder="Your name"
                            autoFocus
                        />
                        <button type="submit" style={{
                            background: '#2563eb',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 12,
                            padding: '10px 28px',
                            fontSize: 20,
                            fontWeight: 600,
                            cursor: 'pointer',
                            marginTop: 8,
                            boxShadow: '0 2px 8px 0 rgba(30,41,59,0.10)',
                            transition: 'background 0.2s',
                        }}>Play</button>
                    </form>
                </div>
            )}
            {wasEaten && !showModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(30,41,59,0.7)',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <div style={{
                        background: '#fff',
                        borderRadius: 24,
                        padding: '32px 40px',
                        boxShadow: '0 8px 32px 0 rgba(0,0,0,0.18)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 20,
                        minWidth: 320,
                    }}>
                        <h2 style={{ color: '#dc2626', fontWeight: 700, fontSize: 28, margin: 0 }}>You were eaten! Game over.</h2>
                        <button onClick={handleRestart} style={{
                            background: '#2563eb',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 12,
                            padding: '10px 28px',
                            fontSize: 20,
                            fontWeight: 600,
                            cursor: 'pointer',
                            marginTop: 8,
                            boxShadow: '0 2px 8px 0 rgba(30,41,59,0.10)',
                            transition: 'background 0.2s',
                        }}>Restart</button>
                    </div>
                </div>
            )}
            <div style={{
                position: 'fixed',
                top: 24,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                background: 'rgba(30,41,59,0.85)',
                color: '#fff',
                borderRadius: '32px',
                minWidth: 120,
                minHeight: 40,
                padding: '0 32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: 22,
                boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)',
                transition: 'all 0.3s cubic-bezier(.4,1.6,.6,1)',
                border: '2px solid #334155',
                letterSpacing: 1,
                gap: 12,
            }}>
                <span role="img" aria-label="score">🍽️</span> {score}
            </div>
            <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', display: 'block', background: '#f0f9ff' }} />
        </>
    );
} 