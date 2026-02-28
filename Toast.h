#ifndef TOAST_H
#define TOAST_H
#pragma once

#include <QWidget>
#include <QLabel>
#include <QTimer>
#include <QPropertyAnimation>
#include <QGraphicsOpacityEffect>
#include <QGraphicsDropShadowEffect>

class Toast : public QWidget
{
    Q_OBJECT
public:
    explicit Toast(QWidget *parent = nullptr);

    void showMessage(const QString &message,
                     const QColor &bgColor,
                     const QColor &textColor = Qt::black,
                     int duration = 2000);

private:
    QLabel *label;
    QGraphicsOpacityEffect *opacityEffect;
    QPropertyAnimation *fadeAnimation;
    QGraphicsDropShadowEffect *shadowEffect;
};

#endif // TOAST_H
