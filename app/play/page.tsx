"use client"

import React, { useRef, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const PLAYER_RADIUS = 20;
const PLAYER_RADIUS_GROWTH = 1;
const FOOD_RADIUS = 8;
const FOOD_RADIUS_GROWTH = 1;
const PLAYER_SPEED = 0.0005;
const WORLD_W = 1920;
const WORLD_H = 1000;
const GAME_ID = 'default';
const WS_BASE_URL = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_WS_BASE_URL || 'localhost:3001') : 'localhost:3001';

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
    const [socket, setSocket] = useState<Socket | null>(null);
    const [players, setPlayers] = useState<any[]>([]);
    const [myId, setMyId] = useState<string | null>(null);
    const [wasEaten, setWasEaten] = useState(false);
    const lastMoveSent = useRef(0);


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
        const s = io(`http://${WS_BASE_URL}`, {
            transports: ['websocket'],
            upgrade: true,
            rememberUpgrade: true
        });
        setSocket(s);
        s.emit('join', { name, gameId: GAME_ID, walletAddress: '0x8e3a9b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a' });
        s.on('state', ({ players, food: foodArr }: { players: any[]; food: any[] }) => {
            setPlayers(players);
            food.current = foodArr;
            if (!myId) {
                const me = players.find((p: any) => p.name === name);
                if (me) setMyId(me.id);
            }
            const me = players.find((p: any) => p.id === (myId || (players.find((p: any) => p.name === name)?.id)));
            setScore(me?.score || 0);
            if (myId && !players.some((p: any) => p.id === myId)) {
                setWasEaten(true);
            }
        });
        s.on('disconnect', () => {
            // Optionally handle disconnect
        });
        return () => { s.disconnect(); };
    }, [showModal, name]);

    useEffect(() => {
        if (!socket || !myId) return;
        let animation: number;
        const sendMove = () => {
            const now = Date.now();
            if (now - lastMoveSent.current > 50) { // 20fps
                socket.emit('move', { x: player.current.x, y: player.current.y });
                lastMoveSent.current = now;
            }
        };
        const handleMouse = (e: MouseEvent) => {
            mouse.current = { x: e.clientX, y: e.clientY };
        };
        const canvas = canvasRef.current;
        canvas?.addEventListener('mousemove', handleMouse);
        const draw = (t: number) => {
            time.current = t / 1000;
            const { w, h } = viewport;
            const me = players.find(p => p.id === myId) || { x: WORLD_W / 2, y: WORLD_H / 2, score: 0 };
            const getRadius = (score: number) => PLAYER_RADIUS + PLAYER_RADIUS_GROWTH * score;
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
            player.current.targetX += (mouseWorld.x - player.current.targetX) * 0.5;
            player.current.targetY += (mouseWorld.y - player.current.targetY) * 0.5;
            player.current.x = Math.max(getRadius(score), Math.min(WORLD_W - getRadius(score), player.current.x));
            player.current.y = Math.max(getRadius(score), Math.min(WORLD_H - getRadius(score), player.current.y));
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
            // Draw a clear border for the world edges
            ctx.save();
            ctx.lineWidth = 18;
            ctx.strokeStyle = '#0ea5e9';
            ctx.shadowColor = '#0ea5e9';
            ctx.shadowBlur = 0;
            ctx.strokeRect(0, 0, WORLD_W, WORLD_H);
            ctx.restore();
            const getFoodRadius = (score: number) => FOOD_RADIUS + FOOD_RADIUS_GROWTH * score;
            food.current.forEach(f => {
                const r = getFoodRadius(f.score || 0);
                ctx.beginPath();
                ctx.arc(f.x, f.y, r, 0, 2 * Math.PI);
                ctx.fillStyle = '#4ade80';
                ctx.shadowColor = '#22d3ee';
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.font = 'bold 14px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#0f172a';
                ctx.fillText(f.score, f.x, f.y - r - 8);
            });
            players.forEach(p => {
                const isMe = p.id === myId;
                const wobble = Math.sin(time.current * 2 + (isMe ? 0 : p.id.length)) * 2;
                const radius = getRadius(p.score || 0) + wobble;
                ctx.beginPath();
                ctx.arc(p.x, p.y, radius, 0, 2 * Math.PI);
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
    }, [socket, myId, players, viewport]);

    useEffect(() => {
        if (!socket || !myId) return;
        const handleClick = (e: MouseEvent) => {
            const { w, h } = viewport;
            const me = players.find(p => p.id === myId) || { x: WORLD_W / 2, y: WORLD_H / 2, score: 0 };
            const getRadius = (score: number) => PLAYER_RADIUS + PLAYER_RADIUS_GROWTH * score;
            const getFoodRadius = (score: number) => FOOD_RADIUS + FOOD_RADIUS_GROWTH * score;
            const camX = me.x - w / 2;
            const camY = me.y - h / 2;
            const clickWorld = { x: camX + e.clientX, y: camY + e.clientY };
            const f = food.current.find(f => Math.hypot(f.x - clickWorld.x, f.y - clickWorld.y) < getFoodRadius(f.score || 0) + getRadius(me.score || 0));
            if (f) socket.emit('eat', { foodId: f.id });
        };
        const canvas = canvasRef.current;
        canvas?.addEventListener('click', handleClick);
        return () => { canvas?.removeEventListener('click', handleClick); };
    }, [socket, myId, players, viewport]);

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
                        background: 'rgba(255,255,255,0.98)',
                        borderRadius: 20,
                        padding: '28px 36px',
                        boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 18,
                        minWidth: 260,
                    }}>
                        <h2 style={{ color: '#0f172a', fontWeight: 700, fontSize: 24, margin: 0 }}>Enter your name</h2>
                        <input
                            ref={nameInputRef}
                            value={name}
                            onChange={e => setName(e.target.value)}
                            style={{
                                fontSize: 18,
                                padding: '8px 14px',
                                borderRadius: 10,
                                border: '1.5px solid #94a3b8',
                                outline: 'none',
                                width: 180,
                                textAlign: 'center',
                                background: '#f8fafc',
                                color: '#0f172a',
                            }}
                            maxLength={16}
                            placeholder="Your name"
                            autoFocus
                        />
                        <button type="submit" style={{
                            background: '#2563eb',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 10,
                            padding: '8px 22px',
                            fontSize: 18,
                            fontWeight: 600,
                            cursor: 'pointer',
                            marginTop: 6,
                            boxShadow: '0 1px 4px 0 rgba(30,41,59,0.08)',
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
                        background: 'rgba(255,255,255,0.98)',
                        borderRadius: 20,
                        padding: '28px 36px',
                        boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 18,
                        minWidth: 260,
                    }}>
                        <h2 style={{ color: '#dc2626', fontWeight: 700, fontSize: 24, margin: 0 }}>You were eaten! Game over.</h2>
                        <button onClick={handleRestart} style={{
                            background: '#2563eb',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 10,
                            padding: '8px 22px',
                            fontSize: 18,
                            fontWeight: 600,
                            cursor: 'pointer',
                            marginTop: 6,
                            boxShadow: '0 1px 4px 0 rgba(30,41,59,0.08)',
                            transition: 'background 0.2s',
                        }}>Restart</button>
                    </div>
                </div>
            )}
            <div style={{
                position: 'fixed',
                top: 18,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                background: 'rgba(30,41,59,0.92)',
                color: '#fff',
                borderRadius: '24px',
                minWidth: 90,
                minHeight: 32,
                padding: '0 22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: 18,
                letterSpacing: 1,
                gap: 10,
                border: '1.5px solid #334155',
                boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
            }}>
                <span role="img" aria-label="score">🍽️</span> {score}
            </div>
            <canvas
                ref={canvasRef}
                style={{
                    position: 'fixed',
                    inset: 0,
                    width: '100vw',
                    height: '100vh',
                    minWidth: '100vw',
                    minHeight: '100vh',
                    maxWidth: '100vw',
                    maxHeight: '100vh',
                    display: 'block',
                    background: 'radial-gradient(circle at 60% 40%, #e0f2fe 0%, #bae6fd 100%)',
                    margin: 0,
                    padding: 0,
                    border: 'none',
                    outline: 'none',
                    zIndex: 0,
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none',
                    overflow: 'hidden',
                }}
            />
            <style jsx global>{`
                html, body, #__next {
                    height: 100%;
                    width: 100%;
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                    background: none;
                }
                body {
                    overscroll-behavior: none;
                }
                *, *::before, *::after {
                    box-sizing: border-box;
                }
                #__next > div {
                    height: 100%;
                    width: 100%;
                }
            `}</style>
        </>
    );
} 