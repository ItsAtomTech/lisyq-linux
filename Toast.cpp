#include "Toast.h"
#include <QHBoxLayout>
#include <QGraphicsOpacityEffect>
#include <QPropertyAnimation>


//Custom Toast Made by Atomtech 2026

Toast::Toast(QWidget *parent)
    : QWidget(parent)
{
    setWindowFlags(Qt::FramelessWindowHint |
                   Qt::Tool |
                   Qt::WindowStaysOnTopHint);

    setAttribute(Qt::WA_TranslucentBackground);

    label = new QLabel(this);
    label->setAlignment(Qt::AlignCenter);

    QHBoxLayout *layout = new QHBoxLayout(this);
    layout->addWidget(label);
    layout->setContentsMargins(15, 10, 15, 10);
    setLayout(layout);

    // Opacity effect for fade in/out
    opacityEffect = new QGraphicsOpacityEffect(this);
    setGraphicsEffect(opacityEffect);
    opacityEffect->setOpacity(0.0);

    // Drop shadow on label (child widget)
    shadowEffect = new QGraphicsDropShadowEffect(label);
    shadowEffect->setBlurRadius(15);
    shadowEffect->setOffset(0, 4);
    shadowEffect->setColor(QColor(0, 0, 0, 160));
    label->setGraphicsEffect(shadowEffect);


    fadeAnimation = new QPropertyAnimation(opacityEffect, "opacity", this);
}




void Toast::showMessage(const QString &message,
                        const QColor &bgColor,
                        const QColor &textColor,
                        int duration)
{
    label->setText(message);

    QString style = QString(
                        "background-color: %1;"
                        "color: %2;"
                        "border-radius: 5px;"
                        "font-weight: normal;"
                        "padding: 5px;"
                        ).arg(bgColor.name(), textColor.name());
    label->setStyleSheet(style);

    adjustSize();

    // Position near bottom
    if (parentWidget())
    {
        int marginBottom = 40;
        int x = (parentWidget()->width() - width()) / 2;
        int y = parentWidget()->height() - height() - marginBottom;
        move(parentWidget()->mapToGlobal(QPoint(x, y)));
    }

    show();

    // Fade in
    fadeAnimation->stop();
    fadeAnimation->setDuration(300);
    fadeAnimation->setStartValue(0.0);
    fadeAnimation->setEndValue(1.0);
    fadeAnimation->start();

    // Fade out after duration
    QTimer::singleShot(duration, this, [=]() {
        fadeAnimation->stop();
        fadeAnimation->setDuration(300);
        fadeAnimation->setStartValue(1.0);
        fadeAnimation->setEndValue(0.0);
        connect(fadeAnimation, &QPropertyAnimation::finished, this, &QWidget::close);
        fadeAnimation->start();
    });
}
